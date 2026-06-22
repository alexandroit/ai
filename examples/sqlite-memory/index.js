import { mkdirSync, rmSync } from "node:fs";
import { dirname } from "node:path";
import { createStacklineAIServer } from "@stackline/ai/server";
import { createSqliteMemoryStore } from "@stackline/ai-memory-sqlite";

const databasePath = new URL("./data/memory.sqlite", import.meta.url).pathname;
mkdirSync(dirname(databasePath), { recursive: true });
rmSync(databasePath, { force: true });

const memory = createSqliteMemoryStore({
  path: databasePath,
  indexUserMessages: true,
  indexAssistantResponses: true,
});

const ai = createStacklineAIServer({
  provider: {
    name: "memory-demo",
    capabilities: () => ({
      streaming: false,
      tools: false,
      vision: false,
      embeddings: false,
      modelListing: false,
      jsonMode: false,
      structuredOutput: false,
    }),
    chat: async () => ({
      role: "assistant",
      model: "memory-demo",
      content: "SQLite memory saved this answer.",
    }),
  },
  rag: false,
  memory: {
    store: memory,
    captureConversation: {
      writeMode: "await",
      mode: "memory",
    },
  },
});

await ai.chat({
  metadata: { sessionId: "demo-session", userId: "demo-user" },
  messages: [{ role: "user", content: "remember sqlite" }],
});

const results = await memory.search?.("SQLite", { limit: 2 });
memory.close();

if (!results?.some((item) => item.content.includes("SQLite memory"))) {
  throw new Error("SQLite memory example did not persist the assistant answer.");
}

console.log("SQLite memory smoke passed.");
