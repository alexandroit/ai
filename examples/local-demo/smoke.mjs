import { readFileSync } from "node:fs";

const html = readFileSync(new URL("./index.html", import.meta.url), "utf8");
const config = readFileSync(new URL("./vite.config.mjs", import.meta.url), "utf8");

if (!html.includes("<stackline-ai-studio")) {
  throw new Error("The local demo must render stackline-ai-studio.");
}

for (const forbidden of ["STACKLINE_AI_API_KEY", "POSTGRES", "PRIVATE_DATASET", "createPostgresRagRetriever", "createSqliteMemoryStore"]) {
  if (config.includes(forbidden)) {
    throw new Error(`The public local demo must not include ${forbidden}.`);
  }
}

console.log("Stackline AI local demo smoke passed.");
