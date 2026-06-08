import { createStacklineAIServer } from "@stackline/ai/server";
import { createStacklineAIHttpHandler } from "@stackline/ai-server";
import { createDemoProvider, createLocalRetriever } from "./demo-core.js";

function createLocalDemoHandler() {
  const ai = createStacklineAIServer({
    provider: createDemoProvider(),
    rag: {
      retriever: createLocalRetriever(),
      maxContextItems: 4,
      onFailure: "continue",
    },
    memory: false,
  });

  return createStacklineAIHttpHandler({
    server: ai,
    basePath: "/api/ai",
  });
}

export function installLocalStacklineAIDemoApi() {
  const handleAI = createLocalDemoHandler();
  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input, init) => {
    const request = new Request(input, init);
    const url = new URL(request.url);

    if (url.pathname === "/api/ai" || url.pathname.startsWith("/api/ai/")) {
      return handleAI(request);
    }

    return originalFetch(input, init);
  };
}
