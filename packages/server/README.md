# @stackline/ai-server

> Fetch-compatible HTTP backend handler for Stackline AI.

[![npm version](https://img.shields.io/npm/v/@stackline/ai-server.svg?style=flat-square)](https://www.npmjs.com/package/@stackline/ai-server)
[![license](https://img.shields.io/npm/l/@stackline/ai-server.svg?style=flat-square)](https://github.com/alexandroit/ai)
[![GitHub repository](https://img.shields.io/badge/GitHub-repository-181717?style=flat-square&logo=github)](https://github.com/alexandroit/ai)
[![Docs](https://img.shields.io/badge/docs-alexandro.net-0f766e?style=flat-square)](https://alexandro.net/docs/ai/)
[![Reddit community](https://img.shields.io/badge/community-r%2FStackline-ff4500?style=flat-square&logo=reddit&logoColor=white)](https://www.reddit.com/r/Stackline/)

**[Documentation](https://alexandro.net/docs/ai/)** | **[npm](https://www.npmjs.com/package/@stackline/ai-server)** | **[Issues](https://github.com/alexandroit/ai/issues)** | **[Repository](https://github.com/alexandroit/ai)**

**Current package version:** `0.0.6`

---

## Why this package?

`@stackline/ai-server` gives the browser one safe backend API without exposing provider keys, Ollama targets, SQL, or memory paths. It is Fetch-compatible by design and can be adapted to Node HTTP, Express, or other runtimes that can create Web `Request` and `Response` objects.

### What This Package Does

This package turns a `StacklineAIServer` from `@stackline/ai` into HTTP routes:

- `GET /api/ai/health`
- `GET /api/ai/manifest`
- `GET /api/ai/models`
- `POST /api/ai/chat`
- `OPTIONS /api/ai/*`

It expects Web Fetch API `Request` objects and returns Web Fetch API
`Response` objects.

It is not an Express middleware by itself.

### When To Use

Use this package when a browser UI needs one safe backend API for health,
manifest, model listing, and chat.

## Compatibility

| Item | Value |
| --- | --- |
| Package | `@stackline/ai-server@0.0.6` |
| Supported Node.js | `>=18.17.0` |
| Module entry | `dist/index.js` (ES modules) |
| Types | `dist/index.d.ts` |
| Runtime dependencies | 1 direct dependency |

### Status

Initial public API, ESM-only, TypeScript declarations included.

### Requirements

- Runtime: Node.js `>=18.17.0`.
- A `StacklineAIServer` from `@stackline/ai`.
- Web Fetch API `Request` and `Response`.

### When Not To Use

Do not pass this handler directly to Express as `app.use(handleAI)`. Express
uses `req`/`res`, while this package expects Web `Request` and returns Web
`Response`.

### Limitations

The current chat response is non-streaming. Request bodies are consumed as a
bounded stream, so `maxBodyBytes` stops oversized input before the complete
payload is buffered.

## Installation

### Install By Situation

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

## Usage

### Complete Node HTTP Example

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

### Express Adapter

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

### Verify The Routes

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

## Security

Add authentication, authorization, rate limiting, restrictive CORS, body limits,
and model allow-lists in production.

## API Surface

### Public API

- `createStacklineAIHttpHandler(options)`
- `StacklineAIHttpHandler`
- `StacklineAIHttpHandlerOptions`
- `StacklineAICorsOptions`

### Configuration

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

### Request And Response Schemas

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

### Error Handling

Errors are JSON:

```json
{ "error": { "message": "messages must be an array.", "status": 400 } }
```

Oversized bodies return `413`, model allow-list failures return `403`, and
other validation/provider failures return `400`. When `allowedModels` is set,
the client must send an explicit `model` value.

The common Ollama model error:

```text
Ollama chat requires a model. Use a model name or model: "auto".
```

means the request model and provider model were empty, or `auto` could not find
an installed model from Ollama `/api/tags`.

### Documentation

- Full tutorial: `docs/getting-started/full-stack-tutorial.md`
- HTTP reference: `docs/reference/http-api.md`

## Local Development

Clone the [monorepo](https://github.com/alexandroit/ai) and run from its root. Repository tooling requires Node.js `>=22.13.0` and `pnpm@11.22.0`; release archives use official Node.js `24.20.0` and npm `11.19.0`.

```bash
pnpm install --frozen-lockfile
pnpm --filter @stackline/ai-server build
pnpm --filter @stackline/ai-server test
pnpm run check
```

## Consumer Smoke Test

### Test The Example

```bash
pnpm --filter stackline-ai-example-express-adapter smoke
```

Pack the release family and validate a fresh consumer, including runtime exports and TypeScript declarations:

```bash
pnpm run pack:release
node scripts/consumer-smoke.mjs release-artifacts
```

## Release Checklist

### Versioning

Use the same release line as `@stackline/ai`.

1. Update the package manifest, changelog, workspace references, and documentation together.
2. Run the workspace checks plus `pnpm audit` and `pnpm audit --prod`.
3. Use [publish.yml](https://github.com/alexandroit/ai/actions/workflows/publish.yml) and confirm `expected_manifest_sha512` against the reviewed `SHA512SUMS` file.
4. Verify each public package's exact bytes and GitHub Actions provenance.

## License

[MIT](https://github.com/alexandroit/ai/blob/main/packages/server/LICENSE). Copyright notices and the credits above are retained.

## Credits and original authors

- Stackline.
- Copyright (c) 2026 Alexandro Marques.
- Stackline maintenance: [Alexandro Paixao Marques](https://www.linkedin.com/in/aleinfo/) and [Stackline contributors](https://github.com/alexandroit).

Original copyright, license notices and contributor acknowledgements remain part of this distribution. Stackline maintenance does not replace authorship of the original work.

## Community and Links

- [Stackline website](https://alexandro.net/)
- [GitHub projects](https://github.com/alexandroit)
- [npm packages](https://www.npmjs.com/~alex360qc)
- [Reddit community — r/Stackline](https://www.reddit.com/r/Stackline/)
- [Maintainer LinkedIn](https://www.linkedin.com/in/aleinfo/)

Use this repository's issue tracker for reproducible bugs and feature requests. Join r/Stackline for examples, usage questions and release discussions.
