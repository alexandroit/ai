# @stackline/ai-server

Fetch-compatible HTTP backend handler for Stackline AI.

Use this package when your frontend needs one safe backend endpoint instead of
calling AI providers directly. Provider keys, model policy, RAG, memory, and
storage stay on the server.

## Highlights

- Fetch-compatible request handler.
- Provides health, manifest, model listing, and chat routes.
- Normalizes incoming chat payloads.
- Supports model allow-lists.
- Supports CORS configuration.
- Enforces a request body size limit.
- Keeps provider credentials out of the browser.

## Install

```bash
npm install @stackline/ai @stackline/ai-server @stackline/ai-ollama
```

## Basic Usage

```ts
import { createStacklineAIServer } from "@stackline/ai/server";
import { createStacklineAIHttpHandler } from "@stackline/ai-server";
import { ollamaProvider } from "@stackline/ai-ollama";

const ai = createStacklineAIServer({
  provider: ollamaProvider({
    target: "http://127.0.0.1:11434",
    model: "auto",
  }),
  rag: false,
  memory: false,
});

export const handleAI = createStacklineAIHttpHandler({
  server: ai,
  basePath: "/api/ai",
});
```

## Routes

With the default `basePath: "/api/ai"`:

- `GET /api/ai/health`
- `GET /api/ai/manifest`
- `GET /api/ai/models`
- `POST /api/ai/chat`

## Chat Request

```ts
await fetch("/api/ai/chat", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    model: "auto",
    messages: [
      { role: "user", content: "Explain this report." }
    ],
    metadata: {
      sessionId: "session-1",
      userId: "user-1"
    }
  }),
});
```

## Model Policy

Restrict requests to known models:

```ts
createStacklineAIHttpHandler({
  server: ai,
  allowedModels: ["llama3.1:latest", "qwen2.5:latest"],
});
```

## CORS

```ts
createStacklineAIHttpHandler({
  server: ai,
  cors: {
    origins: ["https://app.example.com"],
    credentials: true,
  },
});
```

## Body Limit

```ts
createStacklineAIHttpHandler({
  server: ai,
  maxBodyBytes: 512 * 1024,
});
```

## Security Direction

The frontend should call this handler or a backend route that wraps it. Do not
put provider API keys, database credentials, RAG SQL, or memory storage details
in browser code.

## Community

Questions and discussions:

https://www.reddit.com/r/Stackline/
