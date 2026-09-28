import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { packageDirectories } from "./release-packages.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const artifactDir = resolve(root, process.env.STACKLINE_ARTIFACT_DIR || "release-artifacts");
const requiredFiles = [
  "package/package.json",
  "package/README.md",
  "package/LICENSE",
  "package/CHANGELOG.md",
  "package/SECURITY.md",
];

mkdirSync(artifactDir, { recursive: true });
if (readdirSync(artifactDir).some((file) => file.endsWith(".tgz") || file === "SHA512SUMS")) {
  throw new Error(`Release artifact directory is not empty: ${artifactDir}`);
}

const pnpm = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const tarballs = [];

for (const relativeDir of packageDirectories) {
  const packageDir = resolve(root, relativeDir);
  const manifest = JSON.parse(readFileSync(resolve(packageDir, "package.json"), "utf8"));
  const before = new Set(readdirSync(artifactDir));

  execFileSync(pnpm, ["--dir", packageDir, "pack", "--pack-destination", artifactDir], {
    cwd: root,
    stdio: "pipe",
  });

  const created = readdirSync(artifactDir).filter((file) => file.endsWith(".tgz") && !before.has(file));
  if (created.length !== 1) {
    throw new Error(`Expected one archive for ${manifest.name}, received ${created.length}.`);
  }

  const tarball = resolve(artifactDir, created[0]);
  const archive = readFileSync(tarball);
  if (archive.length < 10 || archive[0] !== 0x1f || archive[1] !== 0x8b || archive[2] !== 8 || archive[3] !== 0) {
    throw new Error(`Expected a gzip archive: ${created[0]}.`);
  }
  // RFC 1952 uses 255 for an unspecified OS. The platform marker otherwise
  // differs between macOS and Linux despite identical tar and compressed data.
  archive[9] = 255;
  writeFileSync(tarball, archive);

  const packedManifestText = execFileSync("tar", ["-xOf", tarball, "package/package.json"], {
    encoding: "utf8",
  });
  const packedManifest = JSON.parse(packedManifestText);
  if (packedManifest.name !== manifest.name || packedManifest.version !== manifest.version) {
    throw new Error(`Packed manifest mismatch for ${manifest.name}.`);
  }
  if (packedManifestText.includes("workspace:")) {
    throw new Error(`Workspace protocol leaked into ${created[0]}.`);
  }

  const entries = new Set(
    execFileSync("tar", ["-tzf", tarball], { encoding: "utf8" })
      .split(/\r?\n/)
      .filter(Boolean),
  );
  const entryFiles = [packedManifest.exports["."].import, packedManifest.types]
    .map((file) => `package/${file.replace(/^\.\//, "")}`);
  for (const requiredFile of [...requiredFiles, ...entryFiles]) {
    if (!entries.has(requiredFile)) {
      throw new Error(`${created[0]} is missing ${requiredFile}.`);
    }
  }

  tarballs.push(tarball);
}

const checksumLines = tarballs
  .sort()
  .map((tarball) => {
    const hash = createHash("sha512").update(readFileSync(tarball)).digest("hex");
    return `${hash}  ${basename(tarball)}`;
  });

writeFileSync(resolve(artifactDir, "SHA512SUMS"), `${checksumLines.join("\n")}\n`);
console.log(`Verified ${tarballs.length} release archives in ${artifactDir}.`);
