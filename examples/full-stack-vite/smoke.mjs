import { readFileSync } from "node:fs";

const server = readFileSync(new URL("./index.js", import.meta.url), "utf8");
const client = readFileSync(new URL("./src/index.js", import.meta.url), "utf8");
const html = readFileSync(new URL("./index.html", import.meta.url), "utf8");

for (const text of [server, client, html]) {
  if (!text.includes("stackline")) {
    throw new Error("The full-stack Vite example is missing Stackline wiring.");
  }
}

for (const phrase of [
  "createStacklineAIHttpHandler",
  "requestFromNode",
  "createSqliteMemoryStore",
  "createPostgresRagRetriever",
  "ollamaProvider",
]) {
  if (!server.includes(phrase)) {
    throw new Error(`The full-stack Vite server is missing ${phrase}.`);
  }
}

if (!server.includes("requestFromNode")) {
  throw new Error("The server must use the Fetch-compatible handler adapter.");
}

console.log("Full-stack Vite smoke passed.");
