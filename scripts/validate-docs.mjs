import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

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
const currentVersions = {
  "@stackline/ai": "0.0.3",
  "@stackline/ai-memory-sqlite": "0.0.3",
  "@stackline/ai-ollama": "0.0.3",
  "@stackline/ai-rag-postgres": "0.0.4",
  "@stackline/ai-server": "0.0.3",
  "@stackline/ai-ui": "0.0.5",
};

let failed = false;

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
