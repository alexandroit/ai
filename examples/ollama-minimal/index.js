import { existsSync, readFileSync } from "node:fs";
import { createStacklineAIServer } from "@stackline/ai/server";
import { ollamaProvider } from "@stackline/ai-ollama";

function loadEnv(path = new URL(".env", import.meta.url)) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
  }
}

loadEnv();

const ai = createStacklineAIServer({
  provider: ollamaProvider({
    target: process.env.OLLAMA_TARGET || "http://127.0.0.1:11434",
    model: process.env.OLLAMA_MODEL || "auto",
  }),
  rag: false,
  memory: false,
});

const models = await ai.listModels();
console.log("Available models:", models.map((model) => model.id).join(", ") || "(none)");

const response = await ai.chat({
  model: process.env.OLLAMA_MODEL || "auto",
  messages: [{ role: "user", content: "Reply with one short sentence about Stackline AI." }],
});

console.log(response.content);
