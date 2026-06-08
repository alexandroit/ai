import { defineConfig } from "vite";
import { createStacklineAIServer } from "@stackline/ai/server";
import { createStacklineAIHttpHandler } from "@stackline/ai-server";
import { createDemoProvider, createLocalRetriever } from "./src/demo-core.js";

async function requestFromNode(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return new Request(`http://localhost${req.url}`, {
    method: req.method,
    headers: req.headers,
    body: chunks.length ? Buffer.concat(chunks) : undefined,
  });
}

async function writeNodeResponse(res, response) {
  res.statusCode = response.status;
  response.headers.forEach((value, key) => res.setHeader(key, value));
  res.end(Buffer.from(await response.arrayBuffer()));
}

const ai = createStacklineAIServer({
  provider: createDemoProvider(),
  rag: {
    retriever: createLocalRetriever(),
    maxContextItems: 4,
    onFailure: "continue",
  },
  memory: false,
});

const handleAI = createStacklineAIHttpHandler({
  server: ai,
  basePath: "",
});

export default defineConfig({
  base: "./",
  plugins: [
    {
      name: "stackline-ai-local-demo-api",
      configureServer(server) {
        server.middlewares.use("/api/ai", async (req, res) => {
          const request = await requestFromNode(req);
          const response = await handleAI(request);
          await writeNodeResponse(res, response);
        });
      },
    },
  ],
});
