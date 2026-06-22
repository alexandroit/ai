# @stackline/ai-ui

> Framework-neutral Stackline AI Studio web component for secure AI chat apps, with model picker, language picker, safe Markdown, local history, RAG evidence display, custom styling hooks, and backend-first Ollama integration.

[![npm version](https://img.shields.io/npm/v/@stackline/ai-ui.svg?style=flat-square)](https://www.npmjs.com/package/@stackline/ai-ui)
[![npm monthly](https://img.shields.io/npm/dm/@stackline/ai-ui.svg?style=flat-square)](https://www.npmjs.com/package/@stackline/ai-ui)
[![license](https://img.shields.io/npm/l/@stackline/ai-ui.svg?style=flat-square)](https://github.com/alexandroit/ai/blob/master/LICENSE)
[![Web Component](https://img.shields.io/badge/Web%20Component-framework--neutral-0f8f7e?style=flat-square)](https://developer.mozilla.org/en-US/docs/Web/API/Web_components)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Reddit community](https://img.shields.io/badge/community-r%2FStackline-ff4500?style=flat-square&logo=reddit&logoColor=white)](https://www.reddit.com/r/Stackline/)

**[Documentation & Live Demos](https://alexandro.net/docs/ai/)** | **[npm](https://www.npmjs.com/package/@stackline/ai-ui)** | **[Issues](https://github.com/alexandroit/ai/issues)** | **[Repository](https://github.com/alexandroit/ai)** | **[Community Discussions](https://www.reddit.com/r/Stackline/)**

**Latest tested package release:** `0.0.2`

---

> **Credits:** Stackline AI Studio component architecture, publishing, and documentation by [Alexandro Paixao Marques](https://github.com/alexandroit).

---

## Why this package?

`@stackline/ai-ui` is the browser-facing Studio component for Stackline AI apps. It gives simple users a drop-in interface, while advanced teams can control endpoints, model selection, translations, persistence, CSS variables, CSS parts, and custom headers.

The component is intentionally backend-first: it never stores provider keys, database URLs, SQL, RAG filters, or memory paths. It calls your backend through `/models` and `/chat`.

## Features

| Feature | Supported |
| :--- | :---: |
| Drop-in `<stackline-ai-studio>` custom element | ✅ |
| Framework-neutral usage | ✅ |
| Model picker powered by `@stackline/multiselect` | ✅ |
| Language picker with `en`, `pt`, `fr`, `es` | ✅ |
| Safe Markdown and limited safe HTML rendering | ✅ |
| LocalStorage history with quota protection | ✅ |
| RAG evidence display without persisting evidence metadata | ✅ |
| Clear conversation button | ✅ |
| Custom endpoint attributes | ✅ |
| CSS custom properties and CSS parts | ✅ |
| Public methods and DOM events | ✅ |

## Table of Contents

1. [Why this package?](#why-this-package)
2. [Features](#features)
3. [Status](#status)
4. [The Important Part](#the-important-part)
5. [Install By Situation](#install-by-situation)
6. [Complete Browser-To-Ollama Tutorial](#complete-browser-to-ollama-tutorial)
7. [Minimal UI Markup After The Backend Exists](#minimal-ui-markup-after-the-backend-exists)
8. [Full UI Markup](#full-ui-markup)
9. [Public API](#public-api)
10. [Attributes](#attributes)
11. [Methods](#methods)
12. [Events](#events)
13. [Endpoint Schemas](#endpoint-schemas)
14. [Styling](#styling)
15. [Security](#security)

## Status

Initial public API, ESM-only, TypeScript declarations included. The package
auto-registers `<stackline-ai-studio>` when imported in a browser.

## The Important Part

`<stackline-ai-studio></stackline-ai-studio>` is not a complete AI application.
It is the frontend component. It needs backend endpoints that return models and
chat responses.

Required runtime path:

```text
Browser
  -> <stackline-ai-studio>
  -> GET /api/ai/models
  -> POST /api/ai/chat
  -> @stackline/ai-server
  -> @stackline/ai
  -> provider adapter, for example @stackline/ai-ollama
```

Do not put Ollama Cloud keys, provider keys, database URLs, SQL, RAG filters, or
memory paths in browser code.

## Install By Situation

### Existing Compatible Backend

Use this only when your backend already provides `GET /api/ai/models` and
`POST /api/ai/chat`.

```bash
npm install @stackline/ai-ui
```

### Full UI With Ollama

This is the normal install when you want the Studio tag to work against local
Ollama:

```bash
npm init -y
npm pkg set type=module
npm install @stackline/ai @stackline/ai-server @stackline/ai-ollama @stackline/ai-ui
npm install -D vite
mkdir -p src
```

### Full UI With Ollama And SQLite Memory

```bash
npm init -y
npm pkg set type=module
npm install @stackline/ai @stackline/ai-server @stackline/ai-ollama @stackline/ai-ui @stackline/ai-memory-sqlite
npm install -D vite
mkdir -p data src
```

### Full UI With Ollama And PostgreSQL RAG

```bash
npm init -y
npm pkg set type=module
npm install @stackline/ai @stackline/ai-server @stackline/ai-ollama @stackline/ai-ui @stackline/ai-rag-postgres
npm install -D vite
mkdir -p src
```

### Complete Stack

```bash
npm init -y
npm pkg set type=module
npm install @stackline/ai @stackline/ai-server @stackline/ai-ollama @stackline/ai-ui @stackline/ai-memory-sqlite @stackline/ai-rag-postgres
npm install -D vite
mkdir -p data sql src
```

## Requirements

- Browser with Custom Elements and Shadow DOM.
- Backend endpoints compatible with `@stackline/ai-server`.
- A model returned by `GET /api/ai/models`, or an explicit `model` attribute.

## When To Use

Use this package when you want a drop-in AI chat UI for Vanilla, Angular,
React, Vue, Svelte, Astro, or any frontend that can render a custom element.

## When Not To Use

Do not use this package as a backend or security layer. It cannot protect
provider credentials, database credentials, or private RAG data.

## Complete Browser-To-Ollama Tutorial

This section starts from an empty folder and reaches a working
`<stackline-ai-studio>` connected to local Ollama.

### 1. Create The Project

```bash
mkdir stackline-ai-ui-starter
cd stackline-ai-ui-starter
npm init -y
npm pkg set type=module
npm install @stackline/ai @stackline/ai-server @stackline/ai-ollama @stackline/ai-ui
npm install -D vite
```

### 2. Verify Ollama

```bash
ollama --version
ollama list
ollama pull llama3.1
curl http://127.0.0.1:11434/api/tags
```

Use the exact model name from the `NAME` column of `ollama list`. Examples:

```text
llama3.1
llama3.1:latest
qwen2.5:latest
```

### 3. Configure The Backend

Create `.env`:

```bash
PORT=8787
WEB_ORIGIN=http://localhost:4623
OLLAMA_TARGET=http://127.0.0.1:11434
OLLAMA_MODEL=llama3.1
```

`OLLAMA_MODEL=auto` is supported, but an explicit model is easier to debug for
the first run.

### 4. Create The Backend Server

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

### 5. Test The Backend Before The UI

```bash
node index.js
```

In another terminal:

```bash
curl http://127.0.0.1:8787/api/ai/health
curl http://127.0.0.1:8787/api/ai/models
curl http://127.0.0.1:8787/api/ai/chat \
  -H 'content-type: application/json' \
  -d '{"model":"llama3.1","messages":[{"role":"user","content":"Reply with one short sentence."}]}'
```

If you see:

```text
Ollama chat requires a model. Use a model name or model: "auto".
```

then `model` reached the Ollama adapter empty or `auto` could not resolve an
installed model. Fix it by running `ollama list`, copying the exact model name,
and setting both:

```bash
OLLAMA_MODEL=llama3.1
```

```html
model="llama3.1"
```

### 6. Create The UI

Create `index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Stackline AI Studio</title>
  </head>
  <body>
    <stackline-ai-studio
      endpoint="/api/ai/chat"
      models-endpoint="/api/ai/models"
      model="llama3.1"
      theme="material"
      language="en"
      storage-key="stackline-ai-ui-starter"
      history-limit="50"
    ></stackline-ai-studio>
    <script type="module" src="/src/index.js"></script>
  </body>
</html>
```

Create `src/index.js`:

```js
import "@stackline/ai-ui";
```

Create `src/style.css` if you want a full-screen shell:

```css
html,
body {
  margin: 0;
  min-height: 100%;
}

stackline-ai-studio {
  min-height: 100vh;
}
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

Run:

```bash
npx vite --host 0.0.0.0 --port 4623
```

Open:

```text
http://localhost:4623/
```

## Minimal UI Markup After The Backend Exists

After `/api/ai/models` and `/api/ai/chat` are working, the UI can be as small
as:

```js
import "@stackline/ai-ui";
```

```html
<stackline-ai-studio></stackline-ai-studio>
```

Default endpoints:

- `GET /api/ai/models`
- `POST /api/ai/chat`

## Full UI Markup

```html
<stackline-ai-studio
  endpoint="/api/ai/chat"
  models-endpoint="/api/ai/models"
  theme="material"
  model="llama3.1"
  language="en"
  storage-key="company-ai"
  history-limit="50"
  storage-max-bytes="524288"
></stackline-ai-studio>
```

## Public API

- `defineStacklineAIStudio(win?)`
- `stacklineAIStudioTagName`
- `StacklineAIStudioElement`
- `StacklineAIStudioMessage`
- `StacklineAIStudioModel`
- `StacklineAIStudioLanguage`
- `StacklineAIStudioTranslations`
- `StacklineAIStudioStoredState`

## Attributes

- `endpoint`
- `models-endpoint`
- `model`
- `theme`
- `title`
- `subtitle`
- `placeholder`
- `language`
- `lang`
- `labels`
- `translations`
- `show-language-picker`
- `persist`
- `storage-key`
- `history-limit`
- `storage-max-bytes`

## Methods

```js
const studio = document.querySelector("stackline-ai-studio");

await studio.send("Summarize this ticket.");
studio.setModel("llama3.1");
studio.setLanguage("pt");
studio.setTranslations({ send: "Ask" });
studio.clear();
studio.focusComposer();
```

## Events

```js
studio.addEventListener("stackline-response", (event) => {
  console.log(event.detail.content, event.detail.metadata);
});

studio.addEventListener("stackline-error", (event) => {
  console.error(event.detail.error);
});

studio.addEventListener("stackline-model-change", (event) => {
  console.log(event.detail.model);
});

studio.addEventListener("stackline-language-change", (event) => {
  console.log(event.detail.language);
});
```

## Endpoint Schemas

`GET /api/ai/models` must return:

```json
{
  "models": [
    { "id": "llama3.1", "name": "llama3.1", "provider": "ollama" }
  ]
}
```

`POST /api/ai/chat` must accept:

```json
{
  "model": "llama3.1",
  "messages": [
    { "role": "user", "content": "Hello" }
  ]
}
```

and return:

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

The UI accepts either top-level `content` or `message.content`.

## Local Persistence

The component stores messages, selected model, and selected language in
`localStorage` unless `persist="false"`.

Defaults:

- `history-limit`: `50`
- `storage-max-bytes`: `524288`
- generated storage key: `stackline-ai-studio:<path>:<endpoint>`

RAG evidence metadata is removed before browser persistence.

## Languages

Built-in language codes:

- `en`
- `pt`
- `fr`
- `es`

Use `labels` or `translations` with a JSON object to override text.

## Styling

The component uses Shadow DOM and exposes CSS parts such as:

- `studio`
- `header`
- `header-actions`
- `model-select`
- `language-select`
- `messages`
- `message user`
- `message assistant`
- `clear-button`
- `composer`
- `composer-input`
- `send-button`
- `error`
- `empty`

Common CSS custom properties:

```css
stackline-ai-studio {
  --sai-accent: #0f8f7e;
  --sai-accent-strong: #0a6d60;
}
```

## Markdown And HTML Safety

Assistant responses are rendered as safe Markdown with a limited safe HTML
subset. Code fences remain escaped, so HTML examples render as code. Unsafe
tags and unsafe link schemes are removed.

## Test The Example

```bash
pnpm --filter stackline-ai-local-demo smoke
```

## Security

The UI is not a security boundary. Enforce authentication, authorization, model
policy, rate limits, RAG filters, and provider credentials on the backend.

## Limitations

This is a styled Studio web component, not a fully headless UI package.

## Versioning

Use the same release line as the backend Stackline AI packages.

## License

MIT

## Documentation

- Full tutorial: `docs/getting-started/full-stack-tutorial.md`
- Package reference: `docs/reference/packages.md`
