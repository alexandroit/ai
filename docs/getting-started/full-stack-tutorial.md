# Full-Stack Tutorial

This tutorial starts with an empty folder and ends with a working Stackline AI
app using Ollama, a backend HTTP server, the Studio web component, optional
SQLite memory, and optional PostgreSQL RAG.

The project name is `stackline-ai-starter`.

## Prerequisites

Repository development uses Node `>=22.13.0` because the workspace uses
`pnpm@11.5.2`. A consuming Vite app should use Node `^20.19.0 || >=22.12.0`.

Check your tools:

```bash
node --version
npm --version
ollama --version
```

Check Ollama:

```bash
ollama list
ollama pull llama3.1
ollama run llama3.1
```

If `llama3.1` is not available in your environment, use a model name returned by
`ollama list`. The Stackline Ollama provider also supports `model: "auto"`,
which chooses the first installed model that does not look like an image,
embedding, rerank, or vision-only model.

## Create The Project

```bash
mkdir stackline-ai-starter
cd stackline-ai-starter
npm init -y
npm pkg set type=module
```

## Choose The Install Command

If you want only the core contracts:

```bash
npm install @stackline/ai
```

If you want backend code that calls Ollama directly:

```bash
npm install @stackline/ai @stackline/ai-ollama
```

If you want backend HTTP routes:

```bash
npm install @stackline/ai @stackline/ai-server @stackline/ai-ollama
```

If you want the browser Studio UI to work with Ollama, install the full UI
stack:

```bash
npm install @stackline/ai @stackline/ai-server @stackline/ai-ollama @stackline/ai-ui
npm install -D vite
```

If you also want SQLite memory:

```bash
npm install @stackline/ai-memory-sqlite
mkdir -p data
```

If you also want PostgreSQL RAG:

```bash
npm install @stackline/ai-rag-postgres
mkdir -p sql
```

This full tutorial uses the complete stack:

```bash
npm install @stackline/ai @stackline/ai-server @stackline/ai-ollama @stackline/ai-ui @stackline/ai-memory-sqlite @stackline/ai-rag-postgres
npm install -D vite
mkdir -p data sql src
```

For all combinations, see `docs/getting-started/install-by-scenario.md`.

## Final Structure

```text
stackline-ai-starter/
├── package.json
├── .env
├── .env.example
├── .gitignore
├── index.js
├── vite.config.js
├── index.html
├── src/
│   ├── index.js
│   └── style.css
├── data/
└── sql/
    ├── schema.sql
    └── seed.sql
```

## `package.json`

```json
{
  "name": "stackline-ai-starter",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "node index.js",
    "dev:server": "node index.js",
    "dev:web": "vite --host 0.0.0.0 --port 4623",
    "build": "vite build",
    "start": "node index.js",
    "check": "node smoke.mjs",
    "test": "node smoke.mjs"
  },
  "dependencies": {
    "@stackline/ai": "^0.0.2",
    "@stackline/ai-memory-sqlite": "^0.0.2",
    "@stackline/ai-ollama": "^0.0.2",
    "@stackline/ai-rag-postgres": "^0.0.2",
    "@stackline/ai-server": "^0.0.2",
    "@stackline/ai-ui": "^0.0.4"
  },
  "devDependencies": {
    "vite": "^7.2.7"
  }
}
```

## `.env.example`

```bash
PORT=8787
WEB_ORIGIN=http://localhost:4623
STACKLINE_AI_BASE_PATH=/api/ai
STACKLINE_AI_MAX_BODY_BYTES=262144
STACKLINE_AI_ALLOWED_MODELS=

OLLAMA_TARGET=http://127.0.0.1:11434
OLLAMA_MODEL=auto

STACKLINE_AI_MEMORY=false
STACKLINE_AI_MEMORY_PATH=./data/memory.sqlite

STACKLINE_AI_RAG=false
RAG_DATABASE_URL=postgres://stackline_readonly:stackline@127.0.0.1:5432/stackline_ai
RAG_MIN_QUERY_LENGTH=2
RAG_LIMIT=4
```

Copy it:

```bash
cp .env.example .env
```

## Test Ollama Directly

List models through the Ollama REST API:

```bash
curl http://127.0.0.1:11434/api/tags
```

Chat directly:

```bash
curl http://127.0.0.1:11434/api/chat \
  -H 'content-type: application/json' \
  -d '{
    "model": "llama3.1",
    "messages": [
      { "role": "user", "content": "Reply with one short sentence." }
    ],
    "stream": false
  }'
```

If you see this Stackline error later:

```text
Ollama chat requires a model. Use a model name or model: "auto".
```

it means `model` was empty or `model: "auto"` could not resolve any installed
model from `/api/tags`.

## Backend `index.js`

This server uses the official Fetch-compatible handler from
`@stackline/ai-server`. Node `http` receives `IncomingMessage`/`ServerResponse`,
so the file adapts them to Web `Request`/`Response`.

```js
import { createServer } from "node:http";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createStacklineAIServer } from "@stackline/ai/server";
import { createSqliteMemoryStore } from "@stackline/ai-memory-sqlite";
import { ollamaProvider } from "@stackline/ai-ollama";
import { createPostgresRagRetriever } from "@stackline/ai-rag-postgres";
import { createStacklineAIHttpHandler } from "@stackline/ai-server";

function loadEnv(path = new URL(".env", import.meta.url)) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
  }
}

function bool(value) {
  return ["1", "true", "yes", "on"].includes(String(value || "").toLowerCase());
}

function csv(value) {
  return String(value || "").split(",").map((item) => item.trim()).filter(Boolean);
}

async function requestFromNode(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return new Request(`http://${req.headers.host || "localhost"}${req.url}`, {
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

loadEnv();

const resources = [];
const memoryEnabled = bool(process.env.STACKLINE_AI_MEMORY);
const ragEnabled = bool(process.env.STACKLINE_AI_RAG);

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
    ? { retriever: ragRetriever, maxContextItems: Number(process.env.RAG_LIMIT || 4), onFailure: "continue" }
    : false,
  memory: memoryStore
    ? { store: memoryStore, captureConversation: { writeMode: "await", mode: "both" } }
    : false,
});

const basePath = process.env.STACKLINE_AI_BASE_PATH || "/api/ai";
const handleAI = createStacklineAIHttpHandler({
  server: ai,
  basePath,
  allowedModels: csv(process.env.STACKLINE_AI_ALLOWED_MODELS),
  maxBodyBytes: Number(process.env.STACKLINE_AI_MAX_BODY_BYTES || 256 * 1024),
  cors: { origins: [process.env.WEB_ORIGIN || "http://localhost:4623"] },
});

const server = createServer(async (req, res) => {
  try {
    const request = await requestFromNode(req);
    const response = await handleAI(request);
    await writeNodeResponse(res, response);
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "Unexpected Stackline AI error.";
    res.writeHead(500, { "content-type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ error: { message, status: 500 } }));
  }
});

const port = Number(process.env.PORT || 8787);
server.listen(port, () => {
  console.log(`Stackline AI listening on http://127.0.0.1:${port}${basePath}`);
  console.log(`Mode: memory=${memoryEnabled ? "on" : "off"} rag=${ragEnabled ? "on" : "off"}`);
});

async function shutdown(signal) {
  console.log(`Received ${signal}. Closing resources.`);
  await Promise.allSettled(resources.map((resource) => resource.close?.()));
  server.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
```

## Test The Backend With Curl

Health:

```bash
curl http://127.0.0.1:8787/api/ai/health
```

Manifest:

```bash
curl http://127.0.0.1:8787/api/ai/manifest
```

Models:

```bash
curl http://127.0.0.1:8787/api/ai/models
```

Chat:

```bash
curl http://127.0.0.1:8787/api/ai/chat \
  -H 'content-type: application/json' \
  -d '{
    "model": "auto",
    "messages": [
      { "role": "user", "content": "Explain Stackline AI in one sentence." }
    ],
    "metadata": {
      "sessionId": "demo-session",
      "userId": "demo-user"
    }
  }'
```

Invalid payload:

```bash
curl http://127.0.0.1:8787/api/ai/chat \
  -H 'content-type: application/json' \
  -d '{ "messages": "hello" }'
```

Expected error:

```json
{
  "error": {
    "message": "messages must be an array.",
    "status": 400
  }
}
```

CORS preflight:

```bash
curl -i -X OPTIONS http://127.0.0.1:8787/api/ai/chat \
  -H 'origin: http://localhost:4623' \
  -H 'access-control-request-method: POST'
```

## UI Files

`index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Stackline AI Starter</title>
  </head>
  <body>
    <stackline-ai-studio
      endpoint="/api/ai/chat"
      models-endpoint="/api/ai/models"
      theme="material"
      storage-key="stackline-ai-starter"
    ></stackline-ai-studio>
    <script type="module" src="/src/index.js"></script>
  </body>
</html>
```

`src/index.js`:

```js
import "@stackline/ai-ui";
import "./style.css";

const studio = document.querySelector("stackline-ai-studio");

studio.addEventListener("stackline-response", (event) => {
  console.info("Stackline AI response", event.detail);
});

studio.addEventListener("stackline-error", (event) => {
  console.error("Stackline AI error", event.detail);
});
```

`vite.config.js`:

```js
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    proxy: {
      "/api/ai": "http://127.0.0.1:8787",
    },
  },
});
```

Run two terminals:

```bash
npm run dev:server
npm run dev:web
```

Open:

```text
http://localhost:4623/
```

## SQLite Memory

Set:

```bash
STACKLINE_AI_MEMORY=true
STACKLINE_AI_MEMORY_PATH=./data/memory.sqlite
```

The SQLite store creates the parent folder, migrates tables on first use, saves
interactions, and can search remembered messages. It is intended for
development, tests, and small single-instance deployments.

Delete development data:

```bash
rm -f data/memory.sqlite
```

## PostgreSQL RAG

Create `sql/schema.sql`:

```sql
create table if not exists stackline_ai_documents (
  id text primary key,
  title text not null,
  content text not null,
  source text not null,
  metadata jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create or replace view stackline_ai_rag_view as
select id, title, content, source, metadata, updated_at
from stackline_ai_documents;
```

Create `sql/seed.sql`:

```sql
insert into stackline_ai_documents (id, title, content, source, metadata)
values (
  'starter-architecture',
  'Starter architecture',
  'The Stackline AI starter keeps UI code in the browser and provider/RAG/memory code on the backend.',
  'seed:starter-architecture',
  '{"kind":"guide"}'
)
on conflict (id) do update set
  title = excluded.title,
  content = excluded.content,
  source = excluded.source,
  metadata = excluded.metadata,
  updated_at = now();
```

Enable RAG:

```bash
STACKLINE_AI_RAG=true
RAG_DATABASE_URL=postgres://stackline_readonly:stackline@127.0.0.1:5432/stackline_ai
```

The retriever uses parameterized SQL values. Prefer read-only users and stable
views for production.

## Modes

The same code supports:

1. Ollama only: `STACKLINE_AI_MEMORY=false`, `STACKLINE_AI_RAG=false`.
2. Ollama + SQLite: `STACKLINE_AI_MEMORY=true`, `STACKLINE_AI_RAG=false`.
3. Ollama + PostgreSQL RAG: `STACKLINE_AI_MEMORY=false`, `STACKLINE_AI_RAG=true`.
4. Ollama + SQLite + PostgreSQL RAG: both flags true.
