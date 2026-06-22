import { ollamaProvider } from "@stackline/ai-ollama";
import { createStacklineAIServer } from "@stackline/ai/server";

const provider = ollamaProvider({
  model: "auto",
  fetch: async (input) => {
    if (String(input).endsWith("/api/tags")) {
      return Response.json({ models: [{ name: "demo-chat:latest" }] });
    }
    return Response.json({
      model: "demo-chat:latest",
      message: { role: "assistant", content: "ok" },
    });
  },
});

const ai = createStacklineAIServer({ provider, rag: false, memory: false });
const response = await ai.chat({ messages: [{ role: "user", content: "hello" }] });

if (response.content !== "ok") {
  throw new Error("Ollama minimal smoke failed.");
}

console.log("Ollama minimal smoke passed.");
