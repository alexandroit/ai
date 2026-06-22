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
}

if (failed) process.exit(1);
console.log("Stackline AI docs validation passed.");
