# Stackline AI

> Provider-neutral JavaScript/TypeScript SDK packages for AI applications, with a browser Studio web component, Fetch-compatible backend routes, Ollama provider support, optional SQLite memory, PostgreSQL RAG, and a backend-first security boundary.

[![npm version](https://img.shields.io/npm/v/@stackline/ai.svg?style=flat-square)](https://www.npmjs.com/package/@stackline/ai)
[![npm monthly](https://img.shields.io/npm/dm/@stackline/ai.svg?style=flat-square)](https://www.npmjs.com/package/@stackline/ai)
[![license](https://img.shields.io/npm/l/@stackline/ai.svg?style=flat-square)](https://github.com/alexandroit/ai/blob/main/LICENSE)
[![Node](https://img.shields.io/badge/Node-%3E%3D18.17.0-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Reddit community](https://img.shields.io/badge/community-r%2FStackline-ff4500?style=flat-square&logo=reddit&logoColor=white)](https://www.reddit.com/r/Stackline/)

**[Documentation & Live Demos](https://alexandro.net/docs/ai/)** | **[npm](https://www.npmjs.com/package/@stackline/ai)** | **[Issues](https://github.com/alexandroit/ai/issues)** | **[Repository](https://github.com/alexandroit/ai)** | **[Community Discussions](https://www.reddit.com/r/Stackline/)**

**Latest tested package releases:** core `0.0.3`, PostgreSQL RAG `0.0.4`, UI `0.0.5`

---

> **Credits:** Stackline AI package architecture, publishing, and documentation by [Alexandro Paixao Marques](https://github.com/alexandroit).

---

## Why this ecosystem?

Stackline AI exists to make AI applications installable without hiding the important production boundaries. The browser gets a reusable Studio UI, but providers, API keys, Ollama targets, SQL, RAG filters, and memory paths stay behind a backend route.

The package family is split by responsibility so a user can install only the layer they need: core contracts, HTTP gateway, provider adapter, browser UI, memory, or RAG. A full app can still be installed in one command when the goal is `<stackline-ai-studio>` connected to Ollama.

## Features

| Feature | Supported |
| :--- | :---: |
| Provider-neutral core contracts | ✅ |
| Fetch-compatible backend HTTP handler | ✅ |
| Ollama provider adapter | ✅ |
| Framework-neutral `<stackline-ai-studio>` web component | ✅ |
| Model listing and model picker | ✅ |
| SQLite conversation memory for local/private apps | ✅ |
| PostgreSQL read-only RAG retriever | ✅ |
| Safe Markdown and limited safe HTML rendering in UI | ✅ |
| LocalStorage history with quota protection | ✅ |
| English, Portuguese, French, and Spanish UI labels | ✅ |
| Backend-first security boundary | ✅ |
| Scenario-based install documentation | ✅ |

## Table of Contents

1. [Read This First](#read-this-first)
2. [Packages](#packages)
3. [Install By Scenario](#install-by-scenario)
4. [End-To-End Minimal App](#end-to-end-minimal-app)
5. [Verify Before Opening The UI](#verify-before-opening-the-ui)
6. [Public Local Demo](#public-local-demo)
7. [Full Tutorial](#full-tutorial)
8. [Development](#development)
9. [Examples](#examples)
10. [Security](#security)
11. [Community](#community)
12. [License](#license)

## Read This First

`<stackline-ai-studio></stackline-ai-studio>` is the browser UI only. It does
not talk to Ollama directly, it does not keep provider keys, and it does not
open databases.

A working app needs this path:

```text
Browser
  -> @stackline/ai-ui
  -> GET /api/ai/models
  -> POST /api/ai/chat
  -> @stackline/ai-server
  -> @stackline/ai
  -> @stackline/ai-ollama
  -> Ollama
```

Memory and RAG are backend-only additions:

```text
@stackline/ai
  -> @stackline/ai-memory-sqlite
  -> @stackline/ai-rag-postgres
```

Provider keys, database URLs, SQL, RAG filters, and memory paths stay on the
backend.

## Packages

| Package | Responsibility | Runtime |
|---|---|---|
| `@stackline/ai` | Core contracts, model listing, chat orchestration, RAG, memory capture | backend/shared |
| `@stackline/ai-server` | Fetch-compatible HTTP handler for `/health`, `/manifest`, `/models`, `/chat` | backend |
| `@stackline/ai-ollama` | Ollama provider adapter | backend |
| `@stackline/ai-memory-sqlite` | SQLite/sql.js conversation memory | backend |
| `@stackline/ai-rag-postgres` | Read-only PostgreSQL RAG retriever | backend |
| `@stackline/ai-ui` | Framework-neutral Studio web component | browser |

## Install By Scenario

Do not install only the UI package unless you already have a compatible backend.
Choose the command that matches what you are building.

### Core Only

Custom provider or contract tests, no HTTP and no UI:

```bash
npm init -y
npm pkg set type=module
npm install @stackline/ai
```

### Ollama Provider Only

Backend code that calls Ollama directly, no HTTP and no UI:

```bash
npm init -y
npm pkg set type=module
npm install @stackline/ai @stackline/ai-ollama
```

### Backend API With Ollama

Creates `/api/ai/models` and `/api/ai/chat`:

```bash
npm init -y
npm pkg set type=module
npm install @stackline/ai @stackline/ai-server @stackline/ai-ollama
```

### Full Browser UI With Ollama

This is the normal install when you want
`<stackline-ai-studio></stackline-ai-studio>` to actually work:

```bash
npm init -y
npm pkg set type=module
npm install @stackline/ai @stackline/ai-server @stackline/ai-ollama @stackline/ai-ui
npm install -D vite
```

### Full UI With SQLite Memory

```bash
npm install @stackline/ai @stackline/ai-server @stackline/ai-ollama @stackline/ai-ui @stackline/ai-memory-sqlite
npm install -D vite
mkdir -p data
```

### Full UI With PostgreSQL RAG

```bash
npm install @stackline/ai @stackline/ai-server @stackline/ai-ollama @stackline/ai-ui @stackline/ai-rag-postgres
npm install -D vite
```

### Complete Stack

UI, backend, Ollama, SQLite memory, and PostgreSQL RAG:

```bash
npm install @stackline/ai @stackline/ai-server @stackline/ai-ollama @stackline/ai-ui @stackline/ai-memory-sqlite @stackline/ai-rag-postgres
npm install -D vite
mkdir -p data sql src
```

Detailed installation guide:

```text
docs/getting-started/install-by-scenario.md
```

## End-To-End Minimal App

Create a folder:

```bash
mkdir stackline-ai-starter
cd stackline-ai-starter
npm init -y
npm pkg set type=module
npm install @stackline/ai @stackline/ai-server @stackline/ai-ollama @stackline/ai-ui
npm install -D vite
```

Check Ollama and choose a real model name:

```bash
ollama list
ollama pull llama3.1
curl http://127.0.0.1:11434/api/tags
```

If your installed model is not `llama3.1`, use the exact `NAME` from
`ollama list`.

Create `.env`:

```bash
PORT=8787
WEB_ORIGIN=http://localhost:4623
OLLAMA_TARGET=http://127.0.0.1:11434
OLLAMA_MODEL=llama3.1
```

Create `index.js`:

```js
import { createServer } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { createStacklineAIServer } from "@stackline/ai/server";
import { createStacklineAIHttpHandler } from "@stackline/ai-server";
import { ollamaProvider } from "@stackline/ai-ollama";

function loadEnv(path = new URL(".env", import.meta.url)) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
  }
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

const model = process.env.OLLAMA_MODEL || "auto";
if (!model.trim()) throw new Error("OLLAMA_MODEL is empty.");

const ai = createStacklineAIServer({
  provider: ollamaProvider({
    target: process.env.OLLAMA_TARGET || "http://127.0.0.1:11434",
    model,
  }),
  rag: false,
  memory: false,
});

const handleAI = createStacklineAIHttpHandler({
  server: ai,
  basePath: "/api/ai",
  cors: { origins: [process.env.WEB_ORIGIN || "http://localhost:4623"] },
});

const server = createServer(async (req, res) => {
  try {
    await writeNodeResponse(res, await handleAI(await requestFromNode(req)));
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "Unexpected server error.";
    res.writeHead(500, { "content-type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ error: { message, status: 500 } }));
  }
});

server.listen(Number(process.env.PORT || 8787), () => {
  console.log("Stackline AI API: http://127.0.0.1:8787/api/ai");
});
```

Create `index.html`:

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
      model="llama3.1"
      theme="material"
      language="en"
      storage-key="stackline-ai-starter"
    ></stackline-ai-studio>
    <script type="module" src="/src/index.js"></script>
  </body>
</html>
```

Create `src/index.js`:

```js
import "@stackline/ai-ui";
```

Create `vite.config.js`:

```js
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 4623,
    proxy: {
      "/api/ai": "http://127.0.0.1:8787",
    },
  },
});
```

Run the backend and frontend in two terminals:

```bash
node index.js
```

```bash
npx vite --host 0.0.0.0 --port 4623
```

Open:

```text
http://localhost:4623/
```

## Verify Before Opening The UI

```bash
curl http://127.0.0.1:8787/api/ai/health
curl http://127.0.0.1:8787/api/ai/models
curl http://127.0.0.1:8787/api/ai/chat \
  -H 'content-type: application/json' \
  -d '{"model":"llama3.1","messages":[{"role":"user","content":"Reply with one short sentence."}]}'
```

If the chat request returns:

```text
Ollama chat requires a model. Use a model name or model: "auto".
```

then the model is empty or `auto` could not resolve an installed model. Run
`ollama list`, copy the exact `NAME`, set `OLLAMA_MODEL`, and set the UI
`model` attribute to the same value.

## Public Local Demo

```bash
pnpm install
pnpm --filter stackline-ai-local-demo start
```

Open:

```text
http://localhost:4622/
```

The local demo uses a fake provider and in-memory RAG documents. It does not
use Ollama keys, PostgreSQL, SQLite memory, or private databases.

## Full Tutorial

- `docs/getting-started/full-stack-tutorial.md`
- `docs/concepts/architecture.md`
- `docs/reference/http-api.md`
- `docs/guides/production.md`
- `docs/getting-started/troubleshooting.md`

## Development

Repository tooling requires Node `>=22.13.0` because this workspace uses
`pnpm@11.22.0`.

```bash
corepack enable
pnpm install
pnpm run check
```

`pnpm run check` runs lint, typecheck, tests, build, example smoke tests, and
package dry-run checks.

## Examples

- `examples/local-demo`
- `examples/ollama-minimal`
- `examples/full-stack-vite`
- `examples/express-adapter`
- `examples/sqlite-memory`
- `examples/postgres-rag`
- `examples/complete-stack`

## Security

Never expose provider API keys, Ollama Cloud keys, database credentials, SQL, or
memory paths in browser code. Add authentication, authorization, restrictive
CORS, rate limits, body limits, model allow-lists, tenant filters, and logging
policy in production.

## Community

https://www.reddit.com/r/Stackline/

## License

MIT
