import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const packagesDir = join(root, "packages");
const requiredPackageFields = [
  "name",
  "version",
  "description",
  "license",
  "author",
  "type",
  "exports",
  "types",
  "files",
  "engines",
  "repository",
  "homepage",
  "bugs",
  "publishConfig",
];
const requiredPackageFiles = [ "README.md", "LICENSE", "CHANGELOG.md", "SECURITY.md"];
const secretPatterns = [
  /npm_[A-Za-z0-9]{20,}/,
  /sk-[A-Za-z0-9]{20,}/,
  /api[_-]?key\s*=\s*['"][^'"]+['"]/i,
  /password\s*=\s*['"][^'"]+['"]/i,
  /BEGIN (RSA |OPENSSH |EC )?PRIVATE KEY/,
];
const ignoredDirs = new Set(["node_modules", "dist", ".git", ".vite", ".turbo", "coverage"]);

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

for (const name of readdirSync(packagesDir)) {
  const packagePath = join(packagesDir, name, "package.json");
  if (!existsSync(packagePath)) continue;
  const manifest = readJson(packagePath);

  for (const field of requiredPackageFields) {
    if (manifest[field] === undefined) {
      fail(`${relative(root, packagePath)} is missing ${field}.`);
    }
  }

  if (manifest.type !== "module") {
    fail(`${manifest.name} must publish ESM.`);
  }

  for (const file of requiredPackageFiles) {
    if (!manifest.files?.includes(file)) {
      fail(`${manifest.name} package files must include ${file}.`);
    }
    if (!existsSync(join(packagesDir, name, file))) {
      fail(`${manifest.name} is missing ${file}.`);
    }
  }

  for (const entry of [manifest.exports?.["."]?.import, manifest.types]) {
    if (typeof entry !== "string") {
      fail(`${manifest.name} must declare runtime and type entrypoints.`);
      continue;
    }
    const file = entry.replace(/^\.\//, "");
    if (!existsSync(join(packagesDir, name, file))) {
      fail(`${manifest.name} is missing ${file}. Run pnpm build for generated entries.`);
    }
    if (!manifest.files?.some((included) => file === included || file.startsWith(`${included}/`))) {
      fail(`${manifest.name} package files must include ${file}.`);
    }
  }
  if (manifest.keywords?.filter((keyword) => keyword === "stackline").length !== 1) {
    fail(`${manifest.name} must include the stackline keyword exactly once.`);
  }
  if (manifest.repository?.directory !== `packages/${name}`) {
    fail(`${manifest.name} repository.directory must identify its package source.`);
  }

}

function scan(path) {
  const stat = statSync(path);
  if (stat.isDirectory()) {
    if (ignoredDirs.has(path.split("/").at(-1))) return;
    for (const entry of readdirSync(path)) scan(join(path, entry));
    return;
  }

  if (!/\.(?:md|js|mjs|ts|json|html|css|sql|example)$/.test(path)) return;
  const text = readFileSync(path, "utf8");
  for (const pattern of secretPatterns) {
    if (pattern.test(text)) fail(`${relative(root, path)} appears to contain a secret-like value.`);
  }
}

for (const target of ["README.md", "docs", "examples", "packages"]) {
  const path = join(root, target);
  if (existsSync(path)) scan(path);
}

if (!process.exitCode) {
  console.log("Stackline AI lint passed.");
}
