# Stackline AI Documentation

Stackline AI is a provider-neutral AI application foundation.

Current releases: core family `0.0.3`, UI `0.0.5`.

It separates:

- frontend UI;
- backend HTTP routes;
- provider adapters;
- RAG retrievers;
- memory stores.

The Studio web component is the browser UI. It works only after the backend
routes exist.

Required path:

```text
Browser
  -> <stackline-ai-studio>
  -> GET /api/ai/models
  -> POST /api/ai/chat
  -> @stackline/ai-server
  -> @stackline/ai
  -> provider adapter
```

The default Studio calls `GET /api/ai/models` and `POST /api/ai/chat`.

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

## Install By Scenario

Core only:

```bash
npm install @stackline/ai
```

Backend API with Ollama:

```bash
npm install @stackline/ai @stackline/ai-server @stackline/ai-ollama
```

Full UI with Ollama:

```bash
npm install @stackline/ai @stackline/ai-server @stackline/ai-ollama @stackline/ai-ui
npm install -D vite
```

Complete stack:

```bash
npm install @stackline/ai @stackline/ai-server @stackline/ai-ollama @stackline/ai-ui @stackline/ai-memory-sqlite @stackline/ai-rag-postgres
npm install -D vite
```

## Secure Production Shape

Backend first:

```ts
import { createStacklineAIServer } from "@stackline/ai/server";
import { createStacklineAIHttpHandler } from "@stackline/ai-server";
import { ollamaProvider } from "@stackline/ai-ollama";

const model = process.env.OLLAMA_MODEL || "auto";
if (!model.trim()) throw new Error("OLLAMA_MODEL is empty.");

const ai = createStacklineAIServer({
  provider: ollamaProvider({
    target: process.env.OLLAMA_TARGET,
    apiKey: process.env.OLLAMA_API_KEY,
    model,
  }),
  rag: false,
  memory: false,
});

export const handleAI = createStacklineAIHttpHandler({
  server: ai,
  basePath: "/api/ai",
  allowedModels: [model],
});
```

The HTTP handler enforces its byte limit while reading the request stream,
returns `413` for oversized payloads, and requires an explicit model when an
allow-list is configured.

Frontend:

```html
<stackline-ai-studio
  endpoint="/api/ai/chat"
  models-endpoint="/api/ai/models"
  model="llama3.1"
></stackline-ai-studio>
```

Language picker customization:

```js
const studio = document.querySelector("stackline-ai-studio");

studio.setLanguages([
  { id: "en", label: "EN", nativeName: "English" },
  { id: "pt", label: "PT", nativeName: "Português" },
  { id: "de", label: "DE", nativeName: "Deutsch" }
]);

studio.setTranslationPacks({
  de: {
    placeholder: "Schreiben Sie Ihre Nachricht...",
    send: "Senden"
  }
});

studio.setLanguage("de");
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
