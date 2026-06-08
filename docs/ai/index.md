# Stackline AI Documentation

Stackline AI is a provider-neutral AI application foundation.

It separates:

- frontend UI;
- backend HTTP routes;
- provider adapters;
- RAG retrievers;
- memory stores.

The simplest frontend usage is:

```html
<stackline-ai-studio></stackline-ai-studio>
```

The default Studio calls:

- `GET /api/ai/models`
- `POST /api/ai/chat`

## Public Local Demo

The public demo lives in `examples/local-demo`.

It intentionally avoids:

- API keys;
- PostgreSQL;
- SQLite memory;
- private database connections;
- local Ollama dependencies.

Run it:

```bash
pnpm install
pnpm --filter stackline-ai-local-demo start
```

Open:

```txt
http://localhost:4622/
```

## Secure Production Shape

Frontend:

```html
<stackline-ai-studio
  endpoint="/api/ai/chat"
  models-endpoint="/api/ai/models"
></stackline-ai-studio>
```

Backend:

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

Provider keys and database credentials stay on the backend.

## Packages

- `@stackline/ai`
- `@stackline/ai-server`
- `@stackline/ai-ui`
- `@stackline/ai-ollama`
- `@stackline/ai-memory-sqlite`
- `@stackline/ai-rag-postgres`

## GitHub

https://github.com/alexandroit/ai
