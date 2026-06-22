import { readFileSync } from "node:fs";

const source = readFileSync(new URL("./index.js", import.meta.url), "utf8");

for (const phrase of [
  "ollamaProvider",
  "createSqliteMemoryStore",
  "createPostgresRagRetriever",
  "createStacklineAIHttpHandler",
  "Promise.allSettled",
]) {
  if (!source.includes(phrase)) {
    throw new Error(`Complete stack example is missing ${phrase}.`);
  }
}

console.log("Complete stack smoke passed.");
