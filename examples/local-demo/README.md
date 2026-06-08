# Stackline AI Local Demo

This example is the public, safe version of the Stackline AI Studio app.

It uses:

- `@stackline/ai`
- `@stackline/ai-server`
- `@stackline/ai-ui`
- a local in-memory demo provider
- a local in-memory RAG document list

It does not use:

- Ollama API keys
- Ollama Cloud
- local Ollama
- PostgreSQL
- SQLite memory
- private databases
- secret environment variables

## Run

```bash
pnpm install
pnpm --filter stackline-ai-local-demo start
```

Open:

```txt
http://localhost:4622/
```

## What It Demonstrates

- `GET /api/ai/models` from a local provider.
- `POST /api/ai/chat` through `@stackline/ai-server`.
- Provider-neutral chat through `@stackline/ai`.
- RAG evidence from local demo documents.
- The drop-in `<stackline-ai-studio>` web component.

## Replace The Demo Provider

Production apps should keep provider credentials in the backend.

```ts
import { createStacklineAIServer } from "@stackline/ai/server";
import { createStacklineAIHttpHandler } from "@stackline/ai-server";
import { ollamaProvider } from "@stackline/ai-ollama";

const ai = createStacklineAIServer({
  provider: ollamaProvider({
    target: process.env.OLLAMA_TARGET,
    apiKey: process.env.OLLAMA_API_KEY,
    model: process.env.OLLAMA_MODEL || "auto",
  }),
  rag: false,
  memory: false,
});

export const handleAI = createStacklineAIHttpHandler({
  server: ai,
  basePath: "/api/ai",
});
```
