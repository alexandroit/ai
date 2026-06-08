# Stackline AI

Stackline AI is a provider-neutral foundation for building AI applications with
a clean separation between frontend UI, backend routes, provider adapters, RAG,
and memory.

Repository:

https://github.com/alexandroit/ai

First public package line:

```txt
0.0.1
```

## Public Local Demo

The project includes a safe public demo at `examples/local-demo`.

It has:

- local in-memory provider;
- local in-memory RAG documents;
- the same Stackline AI Studio UI shape used by the private test app.

It does not have:

- Ollama API keys;
- Ollama Cloud calls;
- local Ollama dependency;
- PostgreSQL;
- SQLite memory;
- private database connections;
- secret environment variables.

Run it:

```bash
pnpm install
pnpm --filter stackline-ai-local-demo start
```

Open:

```txt
http://localhost:4622/
```

## Basic Mode

The basic mode stays as simple as a secure backend gateway:

```ts
import { createStacklineAIServer } from "@stackline/ai/server";
import { ollamaProvider } from "@stackline/ai-ollama";

const server = createStacklineAIServer({
  provider: ollamaProvider({
    target: "http://127.0.0.1:11434",
    model: "llama3.1",
  }),
  rag: false,
  memory: false,
});
```

When RAG is enabled, the core server retrieves context and composes the provider
request. The provider adapter only handles its AI API.

```txt
RAG / memory / sources / stores
          |
          v
Stackline AI server
          |
          v
Provider adapter
          |
          v
Ollama / Gemini / OpenAI / Claude / Grok
```

Each AI uses RAG the same way: the Stackline AI server retrieves context,
prepends a provider-neutral context message, and then sends the normalized
request to the selected provider adapter. Ollama, Gemini, OpenAI, Claude, and
Grok adapters should not implement their own RAG pipeline.

Current started packages:

- `@stackline/ai`: core contracts and provider-neutral server.
- `@stackline/ai-ollama`: first provider adapter.
- `@stackline/ai-server`: fetch-compatible backend HTTP handler.
- `@stackline/ai-ui`: framework-neutral Studio web component.
- `@stackline/ai-memory-sqlite`: optional local memory store.
- `@stackline/ai-rag-postgres`: optional read-only PostgreSQL RAG retriever.

Backend example:

```ts
import { createStacklineAIServer } from "@stackline/ai/server";
import { createStacklineAIHttpHandler } from "@stackline/ai-server";
import { ollamaProvider } from "@stackline/ai-ollama";

const ai = createStacklineAIServer({
  provider: ollamaProvider({
    target: "http://127.0.0.1:11434",
    model: "llama3.1",
  }),
  rag: false,
  memory: false,
});

export const handleAI = createStacklineAIHttpHandler({
  server: ai,
  basePath: "/api/ai",
});
```

Frontend example:

```ts
import "@stackline/ai-ui";
```

```html
<stackline-ai-studio></stackline-ai-studio>
```

Advanced users can replace the header and style the component through slots,
CSS variables, and `::part(...)`.

## Public Install

```bash
npm install @stackline/ai @stackline/ai-server @stackline/ai-ui
```

For Ollama backend integration:

```bash
npm install @stackline/ai @stackline/ai-server @stackline/ai-ollama
```

Optional storage/retrieval packages:

```bash
npm install @stackline/ai-memory-sqlite
npm install @stackline/ai-rag-postgres
```

Planned optional providers:

- `@stackline/ai-openai`
- `@stackline/ai-gemini`
- `@stackline/ai-anthropic`
- `@stackline/ai-xai`

Planned optional stores:

- `@stackline/ai-store-sqlite`
- `@stackline/ai-store-postgres`
- `@stackline/ai-store-mysql`
- `@stackline/ai-store-sqlserver`
- `@stackline/ai-store-qdrant`
- `@stackline/ai-store-redis`

No provider SDK or database driver should be installed unless the user chooses
that provider or store.

## Community

https://www.reddit.com/r/Stackline/
