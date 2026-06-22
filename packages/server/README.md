# @stackline/ai-server

> Fetch-compatible HTTP backend handler for Stackline AI, exposing health, manifest, model listing, chat, CORS, body limits, allowed model policy, and framework adapter patterns.

[![npm version](https://img.shields.io/npm/v/@stackline/ai-server.svg?style=flat-square)](https://www.npmjs.com/package/@stackline/ai-server)
[![npm monthly](https://img.shields.io/npm/dm/@stackline/ai-server.svg?style=flat-square)](https://www.npmjs.com/package/@stackline/ai-server)
[![license](https://img.shields.io/npm/l/@stackline/ai-server.svg?style=flat-square)](https://github.com/alexandroit/ai/blob/master/LICENSE)
[![Node](https://img.shields.io/badge/Node-%3E%3D18.17.0-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Reddit community](https://img.shields.io/badge/community-r%2FStackline-ff4500?style=flat-square&logo=reddit&logoColor=white)](https://www.reddit.com/r/Stackline/)

**[Documentation & Live Demos](https://alexandro.net/docs/ai/)** | **[npm](https://www.npmjs.com/package/@stackline/ai-server)** | **[Issues](https://github.com/alexandroit/ai/issues)** | **[Repository](https://github.com/alexandroit/ai)** | **[Community Discussions](https://www.reddit.com/r/Stackline/)**

**Latest tested package release:** `0.0.2`

---

> **Credits:** Stackline AI package architecture, publishing, and documentation by [Alexandro Paixao Marques](https://github.com/alexandroit).

---

## Why this package?

`@stackline/ai-server` gives the browser one safe backend API without exposing provider keys, Ollama targets, SQL, or memory paths. It is Fetch-compatible by design and can be adapted to Node HTTP, Express, or other runtimes that can create Web `Request` and `Response` objects.

## Features

| Feature | Supported |
| :--- | :---: |
| `GET /health` | ✅ |
| `GET /manifest` | ✅ |
| `GET /models` | ✅ |
| `POST /chat` | ✅ |
| CORS handling | ✅ |
| Request body limit | ✅ |
| Allowed model policy | ✅ |
| Fetch-compatible handler | ✅ |
| Express adapter example | ✅ |

## Table of Contents

1. [Why this package?](#why-this-package)
2. [Features](#features)
3. [Status](#status)
4. [What This Package Does](#what-this-package-does)
5. [Install By Situation](#install-by-situation)
6. [Complete Node HTTP Example](#complete-node-http-example)
7. [Express Adapter](#express-adapter)
8. [Verify The Routes](#verify-the-routes)
9. [Public API](#public-api)
10. [Configuration](#configuration)
11. [Request And Response Schemas](#request-and-response-schemas)
12. [Security](#security)

## Status

Initial public API, ESM-only, TypeScript declarations included.

## What This Package Does

This package turns a `StacklineAIServer` from `@stackline/ai` into HTTP routes:

- `GET /api/ai/health`
- `GET /api/ai/manifest`
- `GET /api/ai/models`
- `POST /api/ai/chat`
- `OPTIONS /api/ai/*`

It expects Web Fetch API `Request` objects and returns Web Fetch API
`Response` objects.

It is not an Express middleware by itself.

## Install By Situation

### HTTP Handler With A Custom Provider

```bash
npm init -y
npm pkg set type=module
npm install @stackline/ai @stackline/ai-server
```

### HTTP API With Ollama

```bash
npm init -y
npm pkg set type=module
npm install @stackline/ai @stackline/ai-server @stackline/ai-ollama
```

### HTTP API With Ollama And Browser UI

```bash
npm init -y
npm pkg set type=module
npm install @stackline/ai @stackline/ai-server @stackline/ai-ollama @stackline/ai-ui
npm install -D vite
mkdir -p src
```

### Express Backend

```bash
npm init -y
npm pkg set type=module
npm install express @stackline/ai @stackline/ai-server @stackline/ai-ollama
```

Add `@stackline/ai-ui` and `vite` only if this Express backend also serves a
browser app.

## Requirements

- Runtime: Node.js `>=18.17.0`.
- A `StacklineAIServer` from `@stackline/ai`.
- Web Fetch API `Request` and `Response`.

## When To Use

Use this package when a browser UI needs one safe backend API for health,
manifest, model listing, and chat.

## When Not To Use

Do not pass this handler directly to Express as `app.use(handleAI)`. Express
uses `req`/`res`, while this package expects Web `Request` and returns Web
`Response`.

## Complete Node HTTP Example

```js
import { createServer } from "node:http";
import { createStacklineAIServer } from "@stackline/ai/server";
import { createStacklineAIHttpHandler } from "@stackline/ai-server";
import { ollamaProvider } from "@stackline/ai-ollama";

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
  allowedModels: process.env.STACKLINE_AI_ALLOWED_MODELS
    ? process.env.STACKLINE_AI_ALLOWED_MODELS.split(",").map((item) => item.trim()).filter(Boolean)
    : undefined,
  maxBodyBytes: 256 * 1024,
  cors: {
    origins: [process.env.WEB_ORIGIN || "http://localhost:4623"],
  },
});

const server = createServer(async (req, res) => {
  try {
    const response = await handleAI(await requestFromNode(req));
    await writeNodeResponse(res, response);
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

## Express Adapter

Use an adapter that converts Express `req`/`res` to Web `Request`/`Response`.
Do not run `express.json()` before this route, because the Stackline handler
reads the request body.

```js
import express from "express";
import { createStacklineAIServer } from "@stackline/ai/server";
import { createStacklineAIHttpHandler } from "@stackline/ai-server";
import { ollamaProvider } from "@stackline/ai-ollama";

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
  provider: ollamaProvider({
    target: process.env.OLLAMA_TARGET || "http://127.0.0.1:11434",
    model: process.env.OLLAMA_MODEL || "auto",
  }),
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
    const response = await handleAI(await requestFromExpress(req));
    await writeExpressResponse(res, response);
  } catch (error) {
    next(error);
  }
});

app.listen(8788, () => {
  console.log("Express API: http://127.0.0.1:8788/api/ai");
});
```

## Verify The Routes

```bash
curl http://127.0.0.1:8787/api/ai/health
curl http://127.0.0.1:8787/api/ai/manifest
curl http://127.0.0.1:8787/api/ai/models
curl -i -X OPTIONS http://127.0.0.1:8787/api/ai/chat \
  -H 'origin: http://localhost:4623' \
  -H 'access-control-request-method: POST'
curl http://127.0.0.1:8787/api/ai/chat \
  -H 'content-type: application/json' \
  -d '{"model":"llama3.1","messages":[{"role":"user","content":"Hello"}]}'
```

## Public API

- `createStacklineAIHttpHandler(options)`
- `StacklineAIHttpHandler`
- `StacklineAIHttpHandlerOptions`
- `StacklineAICorsOptions`

## Configuration

```js
createStacklineAIHttpHandler({
  server: ai,
  basePath: "/api/ai",
  allowedModels: ["llama3.1"],
  maxBodyBytes: 256 * 1024,
  cors: {
    origins: ["https://app.example.com"],
    credentials: true,
  },
});
```

## Request And Response Schemas

`POST /chat` accepts:

```json
{
  "model": "llama3.1",
  "messages": [
    { "role": "user", "content": "Hello" }
  ],
  "temperature": 0.2,
  "metadata": {
    "sessionId": "demo-session",
    "userId": "user-1"
  }
}
```

`POST /chat` returns:

```json
{
  "message": {
    "role": "assistant",
    "content": "Hello.",
    "model": "llama3.1"
  },
  "content": "Hello.",
  "model": "llama3.1"
}
```

## Error Handling

Errors are JSON:

```json
{ "error": { "message": "messages must be an array.", "status": 400 } }
```

Model allow-list failures return `403`. Other validation/provider failures
return `400`.

The common Ollama model error:

```text
Ollama chat requires a model. Use a model name or model: "auto".
```

means the request model and provider model were empty, or `auto` could not find
an installed model from Ollama `/api/tags`.

## Test The Example

```bash
pnpm --filter stackline-ai-example-express-adapter smoke
```

## Security

Add authentication, authorization, rate limiting, restrictive CORS, body limits,
and model allow-lists in production.

## Limitations

The current handler is non-streaming. It reads JSON bodies through
`request.text()`.

## Versioning

Use the same release line as `@stackline/ai`.

## License

MIT

## Documentation

- Full tutorial: `docs/getting-started/full-stack-tutorial.md`
- HTTP reference: `docs/reference/http-api.md`
