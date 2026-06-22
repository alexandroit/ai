import { createServer } from "node:http";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createStacklineAIServer } from "@stackline/ai/server";
import { createSqliteMemoryStore } from "@stackline/ai-memory-sqlite";
import { createStacklineAIHttpHandler } from "@stackline/ai-server";
import { ollamaProvider } from "@stackline/ai-ollama";
import { createPostgresRagRetriever } from "@stackline/ai-rag-postgres";

function loadEnv(path = new URL(".env", import.meta.url)) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
  }
}

function requestFromNode(req) {
  const chunks = [];
  return new Promise((resolve, reject) => {
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("error", reject);
    req.on("end", () => {
      resolve(
        new Request(`http://${req.headers.host || "localhost"}${req.url}`, {
          method: req.method,
          headers: req.headers,
          body: chunks.length ? Buffer.concat(chunks) : undefined,
        }),
      );
    });
  });
}

async function writeNodeResponse(res, response) {
  res.statusCode = response.status;
  response.headers.forEach((value, key) => res.setHeader(key, value));
  res.end(Buffer.from(await response.arrayBuffer()));
}

function csv(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function bool(value) {
  return ["1", "true", "yes", "on"].includes(String(value || "").toLowerCase());
}

loadEnv();

const port = Number(process.env.PORT || 8787);
const basePath = process.env.STACKLINE_AI_BASE_PATH || "/api/ai";
const allowedModels = csv(process.env.STACKLINE_AI_ALLOWED_MODELS);
const memoryEnabled = bool(process.env.STACKLINE_AI_MEMORY);
const ragEnabled = bool(process.env.STACKLINE_AI_RAG);
const resources = [];

const memoryPath = resolve(process.env.STACKLINE_AI_MEMORY_PATH || "./data/memory.sqlite");
const memoryStore = memoryEnabled
  ? createSqliteMemoryStore({
      path: memoryPath,
      indexAssistantResponses: true,
      indexUserMessages: true,
    })
  : null;

if (memoryStore) {
  mkdirSync(dirname(memoryPath), { recursive: true });
  resources.push(memoryStore);
}

const ragRetriever = ragEnabled
  ? createPostgresRagRetriever({
      connectionString: process.env.RAG_DATABASE_URL,
      minQueryLength: Number(process.env.RAG_MIN_QUERY_LENGTH || 2),
      limit: Number(process.env.RAG_LIMIT || 4),
      sql: `
        select id, title, content, source, metadata, 100 as score
        from stackline_ai_rag_view
        where content ilike $1 or title ilike $1
        order by updated_at desc
        limit $2
      `,
    })
  : null;

if (ragRetriever) resources.push(ragRetriever);

const ai = createStacklineAIServer({
  provider: ollamaProvider({
    target: process.env.OLLAMA_TARGET || "http://127.0.0.1:11434",
    model: process.env.OLLAMA_MODEL || "auto",
  }),
  rag: ragRetriever
    ? {
        retriever: ragRetriever,
        maxContextItems: Number(process.env.RAG_LIMIT || 4),
        onFailure: "continue",
      }
    : false,
  memory: memoryStore
    ? {
        store: memoryStore,
        captureConversation: {
          writeMode: "await",
          mode: "both",
        },
      }
    : false,
});

const handleAI = createStacklineAIHttpHandler({
  server: ai,
  basePath,
  allowedModels,
  maxBodyBytes: Number(process.env.STACKLINE_AI_MAX_BODY_BYTES || 256 * 1024),
  cors: {
    origins: [process.env.WEB_ORIGIN || "http://localhost:4623"],
  },
});

const server = createServer(async (req, res) => {
  try {
    const request = await requestFromNode(req);
    const response = await handleAI(request);
    await writeNodeResponse(res, response);
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "Unexpected server error.";
    res.writeHead(500, { "content-type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ error: { message, status: 500 } }));
  }
});

server.listen(port, () => {
  console.log(`Stackline AI server listening on http://127.0.0.1:${port}${basePath}`);
  console.log(`Routes: GET ${basePath}/health, GET ${basePath}/manifest, GET ${basePath}/models, POST ${basePath}/chat`);
  console.log(`Mode: memory=${memoryEnabled ? "on" : "off"} rag=${ragEnabled ? "on" : "off"}`);
});

async function shutdown(signal) {
  console.log(`Received ${signal}. Closing Stackline AI server.`);
  await Promise.allSettled(resources.map((resource) => resource.close?.()));
  server.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
