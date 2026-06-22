import express from "express";
import { createStacklineAIServer } from "@stackline/ai/server";
import { createStacklineAIHttpHandler } from "@stackline/ai-server";

function createFakeProvider() {
  return {
    name: "fake",
    capabilities: () => ({
      streaming: false,
      tools: false,
      vision: false,
      embeddings: false,
      modelListing: true,
      jsonMode: false,
      structuredOutput: false,
    }),
    listModels: async () => [{ id: "fake-chat", provider: "fake" }],
    chat: async (request) => ({
      role: "assistant",
      model: request.model || "fake-chat",
      content: `Echo: ${request.messages.at(-1)?.content || ""}`,
    }),
  };
}

async function requestFromExpress(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return new Request(`${req.protocol}://${req.get("host")}${req.originalUrl}`, {
    method: req.method,
    headers: req.headers,
    body: chunks.length ? Buffer.concat(chunks) : undefined,
  });
}

async function writeExpressResponse(res, response) {
  res.status(response.status);
  response.headers.forEach((value, key) => res.setHeader(key, value));
  res.send(Buffer.from(await response.arrayBuffer()));
}

const ai = createStacklineAIServer({
  provider: createFakeProvider(),
  rag: false,
  memory: false,
});

const handleAI = createStacklineAIHttpHandler({
  server: ai,
  basePath: "",
});

const app = express();

app.use("/api/ai", async (req, res, next) => {
  try {
    const request = await requestFromExpress(req);
    const response = await handleAI(request);
    await writeExpressResponse(res, response);
  } catch (error) {
    next(error);
  }
});

const port = Number(process.env.PORT || 8788);
app.listen(port, () => {
  console.log(`Express adapter listening on http://127.0.0.1:${port}/api/ai`);
});
