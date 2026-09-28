import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { releasePackages } from "./release-packages.mjs";

const root = new URL("..", import.meta.url).pathname;
const requiredDocs = [
  "docs/index.md",
  "docs/getting-started/full-stack-tutorial.md",
  "docs/getting-started/troubleshooting.md",
  "docs/concepts/architecture.md",
  "docs/guides/production.md",
  "docs/reference/http-api.md",
  "docs/reference/packages.md",
  "docs/internal/documentation-audit.md",
];
const requiredPhrases = [
  "createStacklineAIServer",
  "createStacklineAIHttpHandler",
  "ollamaProvider",
  "createSqliteMemoryStore",
  "createPostgresRagRetriever",
  "stackline-ai-studio",
];
const currentVersions = Object.fromEntries(
  releasePackages(root).filter(({ manifest }) => manifest.name.startsWith("@stackline/"))
    .map(({ manifest }) => [manifest.name, manifest.version]),
);

let failed = false;

for (const { directory, manifest } of releasePackages(root)) {
  const readme = readFileSync(join(root, directory, "README.md"), "utf8");
  if (!readme.includes("**Package version:** `" + manifest.version + "`")) {
    console.error(`${directory}/README.md does not match its package version.`);
    failed = true;
  }
  if (!readme.includes("https://www.reddit.com/r/Stackline/")) {
    console.error(`${directory}/README.md is missing the Stackline community link.`);
    failed = true;
  }
}


for (const doc of requiredDocs) {
  const path = join(root, doc);
  if (!existsSync(path)) {
    console.error(`${doc} is missing.`);
    failed = true;
  }
}

const tutorialPath = join(root, "docs/getting-started/full-stack-tutorial.md");
if (existsSync(tutorialPath)) {
  const text = readFileSync(tutorialPath, "utf8");
  for (const phrase of requiredPhrases) {
    if (!text.includes(phrase)) {
      console.error(`full-stack tutorial does not mention ${phrase}.`);
      failed = true;
    }
  }
  for (const [packageName, version] of Object.entries(currentVersions)) {
    if (!text.includes(`"${packageName}": "^${version}"`)) {
      console.error(`full-stack tutorial does not use ${packageName}@${version}.`);
      failed = true;
    }
  }
  if (!text.includes('"vite": "^8.2.1"')) {
    console.error("full-stack tutorial does not use Vite 8.2.1.");
    failed = true;
  }
}

const httpReferencePath = join(root, "docs/reference/http-api.md");
if (existsSync(httpReferencePath) && !readFileSync(httpReferencePath, "utf8").includes("return `413`")) {
  console.error("HTTP reference does not document the oversized-body 413 response.");
  failed = true;
}

if (failed) process.exit(1);
console.log("Stackline AI docs validation passed.");
