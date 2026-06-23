# Package Reference

## `@stackline/ai`

Core contracts and orchestration.

Install:

```bash
npm install @stackline/ai
```

Public imports:

```js
import { createStacklineAIServer } from "@stackline/ai";
import { createStacklineAIServer } from "@stackline/ai/server";
```

Use the core when you need provider-neutral RAG, memory capture, model listing,
and chat orchestration.

## `@stackline/ai-server`

Fetch-compatible HTTP handler.

Install with Ollama:

```bash
npm install @stackline/ai @stackline/ai-server @stackline/ai-ollama
```

```js
import { createStacklineAIHttpHandler } from "@stackline/ai-server";
```

Use it directly in Fetch-compatible runtimes, or adapt Node/Express requests to
Web `Request` objects.

## `@stackline/ai-ollama`

Ollama provider adapter.

Install:

```bash
npm install @stackline/ai @stackline/ai-ollama
```

```js
import { ollamaProvider } from "@stackline/ai-ollama";
```

Options:

- `target`
- `apiKey`
- `model`
- `fetch`

Default target: `http://127.0.0.1:11434`.

## `@stackline/ai-memory-sqlite`

SQLite/sql.js memory store.

Install:

```bash
npm install @stackline/ai @stackline/ai-memory-sqlite
```

```js
import { createSqliteMemoryStore } from "@stackline/ai-memory-sqlite";
```

Options:

- `path`
- `indexAssistantResponses`
- `indexUserMessages`
- `storeRagContexts`
- `storeRagMetadata`

## `@stackline/ai-rag-postgres`

Read-only PostgreSQL retriever.

Install:

```bash
npm install @stackline/ai @stackline/ai-rag-postgres
```

```js
import { createPostgresRagRetriever } from "@stackline/ai-rag-postgres";
```

Options:

- `connectionString`
- `connection`
- `client`
- `sql`
- `query`
- `mapRow`
- `limit`
- `minQueryLength`

## `@stackline/ai-ui`

Framework-neutral web component.

Install only when a backend already exists:

```bash
npm install @stackline/ai-ui
```

Install for a new UI app with Ollama:

```bash
npm install @stackline/ai @stackline/ai-server @stackline/ai-ollama @stackline/ai-ui
npm install -D vite
```

This package is the browser UI only. It expects compatible backend endpoints
before the tag can chat:

```text
GET /api/ai/models
POST /api/ai/chat
```

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

Attributes:

- `endpoint`
- `models-endpoint`
- `model`
- `theme`
- `title`
- `subtitle`
- `placeholder`
- `language`
- `lang`
- `languages`
- `labels`
- `translations`
- `translation-packs`
- `show-language-picker`
- `persist`
- `storage-key`
- `history-limit`
- `storage-max-bytes`

Events:

- `stackline-response`
- `stackline-error`
- `stackline-model-change`
- `stackline-language-change`

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
