# Stackline AI

Stackline AI is a provider-neutral TypeScript SDK family for building AI
applications with a clean boundary between browser UI, backend routes, provider
adapters, memory, and RAG.

## Packages

- `@stackline/ai`
- `@stackline/ai-server`
- `@stackline/ai-ollama`
- `@stackline/ai-memory-sqlite`
- `@stackline/ai-rag-postgres`
- `@stackline/ai-ui`

## Start Here

- [Install by scenario](./getting-started/install-by-scenario.md)
- [Full-stack tutorial](./getting-started/full-stack-tutorial.md)
- [Architecture](./concepts/architecture.md)
- [API reference](./reference/api.md)
- [HTTP API](./reference/http-api.md)
- [Package reference](./reference/packages.md)
- [Production guide](./guides/production.md)
- [Troubleshooting](./getting-started/troubleshooting.md)

## Quick Install

```bash
npm install @stackline/ai @stackline/ai-server @stackline/ai-ollama @stackline/ai-ui
```

For memory and RAG:

```bash
npm install @stackline/ai-memory-sqlite @stackline/ai-rag-postgres
```

## Important Runtime Path

The Studio tag is the browser UI only. A working app needs backend endpoints
first:

```text
Browser
  -> <stackline-ai-studio>
  -> GET /api/ai/models
  -> POST /api/ai/chat
  -> @stackline/ai-server
  -> @stackline/ai
  -> provider adapter
```

Provider keys, database credentials, SQL, and memory paths belong on the
backend only.

## Backend First

Start by making `/api/ai/models` and `/api/ai/chat` work:

```js
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

Verify:

```bash
curl http://127.0.0.1:8787/api/ai/models
curl http://127.0.0.1:8787/api/ai/chat \
  -H 'content-type: application/json' \
  -d '{"model":"llama3.1","messages":[{"role":"user","content":"Hello"}]}'
```

## Then Render The Browser UI

```js
import "@stackline/ai-ui";
```

```html
<stackline-ai-studio
  endpoint="/api/ai/chat"
  models-endpoint="/api/ai/models"
  model="llama3.1"
></stackline-ai-studio>
```
