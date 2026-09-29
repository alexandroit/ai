# @stackline/ai-ui

> Framework-neutral Stackline AI Studio web component.

[![npm version](https://img.shields.io/npm/v/@stackline/ai-ui.svg?style=flat-square)](https://www.npmjs.com/package/@stackline/ai-ui)
[![license](https://img.shields.io/npm/l/@stackline/ai-ui.svg?style=flat-square)](https://github.com/alexandroit/ai)
[![GitHub repository](https://img.shields.io/badge/GitHub-repository-181717?style=flat-square&logo=github)](https://github.com/alexandroit/ai)
[![Docs](https://img.shields.io/badge/docs-alexandro.net-0f766e?style=flat-square)](https://alexandro.net/docs/ai/)
[![Reddit community](https://img.shields.io/badge/community-r%2FStackline-ff4500?style=flat-square&logo=reddit&logoColor=white)](https://www.reddit.com/r/Stackline/)

**[Documentation](https://alexandro.net/docs/ai/)** | **[npm](https://www.npmjs.com/package/@stackline/ai-ui)** | **[Issues](https://github.com/alexandroit/ai/issues)** | **[Repository](https://github.com/alexandroit/ai)**

**Current package version:** `0.0.8`

---

## Why this package?

`@stackline/ai-ui` is the browser-facing Studio component for Stackline AI apps. It gives simple users a drop-in interface, while advanced teams can control endpoints, model selection, translations, persistence, CSS variables, and CSS parts.

The component is intentionally backend-first: it never stores provider keys, database URLs, SQL, RAG filters, or memory paths. It calls your backend through `/models` and `/chat`.

### The Important Part

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

### When To Use

Use this package when you want a drop-in AI chat UI for Vanilla, Angular,
React, Vue, Svelte, Astro, or any frontend that can render a custom element.

## Compatibility

| Item | Value |
| --- | --- |
| Package | `@stackline/ai-ui@0.0.8` |
| Supported Node.js | `>=18.17.0` |
| Module entry | `dist/index.js` (ES modules) |
| Types | `dist/index.d.ts` |
| Runtime dependencies | 1 direct dependency |

### Status

Initial public API, ESM-only, TypeScript declarations included. The package
auto-registers `<stackline-ai-studio>` when imported in a browser.

### Requirements

- Browser with Custom Elements and Shadow DOM.
- Backend endpoints compatible with `@stackline/ai-server`.
- A model returned by `GET /api/ai/models`, or an explicit `model` attribute.

### When Not To Use

Do not use this package as a backend or security layer. It cannot protect
provider credentials, database credentials, or private RAG data.

### Limitations

This is a styled Studio web component, not a fully headless UI package.

## Installation

### Install By Situation

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

## Usage

### Complete Browser-To-Ollama Tutorial

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

### Minimal UI Markup After The Backend Exists

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

### Full UI Markup

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

## Features

| Feature | Supported |
| :--- | :---: |
| Drop-in `<stackline-ai-studio>` custom element | ✅ |
| Framework-neutral usage | ✅ |
| Model picker powered by `@stackline/multiselect` | ✅ |
| Language picker with built-in `en`, `pt`, `fr`, `es` plus custom languages | ✅ |
| Safe Markdown and limited safe HTML rendering | ✅ |
| LocalStorage history with quota protection | ✅ |
| RAG evidence display without persisting evidence metadata | ✅ |
| Clear conversation button | ✅ |
| Custom endpoint attributes | ✅ |
| CSS custom properties and CSS parts | ✅ |
| Public methods and DOM events | ✅ |

## Security

### Markdown And HTML Safety

Assistant responses are rendered as safe Markdown with a limited safe HTML
subset. Code fences remain escaped, so HTML examples render as code. Unsafe
tags and unsafe link schemes are removed.

The UI is not a security boundary. Enforce authentication, authorization, model
policy, rate limits, RAG filters, and provider credentials on the backend.

## API Surface

### Public API

- `defineStacklineAIStudio(win?)`
- `stacklineAIStudioTagName`
- `StacklineAIStudioElement`
- `StacklineAIStudioMessage`
- `StacklineAIStudioModel`
- `StacklineAIStudioBuiltInLanguage`
- `StacklineAIStudioLanguage`
- `StacklineAIStudioLanguageOption`
- `StacklineAIStudioTranslationPack`
- `StacklineAIStudioTranslationPacks`
- `StacklineAIStudioTranslationInput`
- `StacklineAIStudioTranslationLoader`
- `StacklineAIStudioTranslations`
- `StacklineAIStudioStoredState`

### Attributes

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

### Methods

```js
const studio = document.querySelector("stackline-ai-studio");

await studio.send("Summarize this ticket.");
studio.setModel("llama3.1");
studio.setLanguage("pt");
studio.setTranslations({ send: "Ask" }); // current language override
studio.setLanguages([
  { id: "en", label: "EN", nativeName: "English" },
  { id: "pt", label: "PT", nativeName: "Português" },
  { id: "de", label: "DE", nativeName: "Deutsch" }
]);
studio.setTranslationPacks({
  de: {
    placeholder: "Schreiben Sie Ihre Nachricht...",
    send: "Senden",
    clear: "Leeren"
  }
});
studio.registerLanguage("it", { send: "Invia" });
studio.clear();
studio.focusComposer();
```

### Events

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

### Endpoint Schemas

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

### Local Persistence

The component stores messages, selected model, and selected language in
`localStorage` unless `persist="false"`.

Defaults:

- `history-limit`: `50`
- `storage-max-bytes`: `524288`
- generated storage key: `stackline-ai-studio:<path>:<endpoint>`

RAG evidence metadata is removed before browser persistence.

### Languages

Built-in language codes:

- `en`
- `pt`
- `fr`
- `es`

The built-ins are only the default. Applications can add their own languages
without changing the package.

### HTML configuration

Use `languages` for the picker options and `translation-packs` for per-language
text:

```html
<stackline-ai-studio
  language="de"
  languages='[
    { "id": "en", "label": "EN", "nativeName": "English" },
    { "id": "pt", "label": "PT", "nativeName": "Português" },
    { "id": "de", "label": "DE", "nativeName": "Deutsch" }
  ]'
  translation-packs='{
    "de": {
      "placeholder": "Schreiben Sie Ihre Nachricht...",
      "send": "Senden",
      "clear": "Leeren"
    }
  }'
></stackline-ai-studio>
```

`labels` and root-level `translations` still override the active language:

```html
<stackline-ai-studio labels='{ "send": "Ask" }'></stackline-ai-studio>
```

### JavaScript configuration

```js
const studio = document.querySelector("stackline-ai-studio");

studio.setLanguages([
  { id: "en", label: "EN", nativeName: "English" },
  { id: "pt", label: "PT", nativeName: "Português" },
  { id: "fr", label: "FR", nativeName: "Français" },
  { id: "es", label: "ES", nativeName: "Español" },
  { id: "de", label: "DE", nativeName: "Deutsch" }
]);

studio.setTranslationPacks({
  de: {
    title: "Stackline AI Studio",
    subtitle: "Sichere KI-Unterhaltung.",
    placeholder: "Schreiben Sie Ihre Nachricht...",
    send: "Senden",
    sending: "Wird gesendet",
    clear: "Leeren"
  }
});

studio.setLanguage("de");
```

If you only need to add one language, use `registerLanguage`:

```js
studio.registerLanguage(
  { id: "it", label: "IT", nativeName: "Italiano" },
  { placeholder: "Scrivi un messaggio...", send: "Invia" }
);
```

For many languages, lazy-load translation files:

```js
studio.setLanguages([
  { id: "en", label: "EN", nativeName: "English" },
  { id: "ja", label: "JA", nativeName: "日本語" }
]);

studio.loadTranslations = async (language) => {
  const response = await fetch(`/i18n/${language}.json`);
  return response.ok ? response.json() : null;
};

studio.setLanguage("ja");
```

Fallback order:

1. active-language custom pack;
2. built-in language or short-code match, such as `pt-BR` -> `pt`;
3. English built-in text;
4. active-language one-off overrides from `labels`, root `translations`, or
   `setTranslations({ send: "Ask" })`.

### Styling

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

### Documentation

- Full tutorial: `docs/getting-started/full-stack-tutorial.md`
- Package reference: `docs/reference/packages.md`

## Local Development

Clone the [monorepo](https://github.com/alexandroit/ai) and run from its root. Repository tooling requires Node.js `>=22.13.0` and `pnpm@11.22.0`; release archives use official Node.js `24.20.0` and npm `11.19.0`.

```bash
pnpm install --frozen-lockfile
pnpm --filter @stackline/ai-ui build
pnpm --filter @stackline/ai-ui test
pnpm run check
```

## Consumer Smoke Test

### Test The Example

```bash
pnpm --filter stackline-ai-local-demo smoke
```

Pack the release family and validate a fresh consumer, including runtime exports and TypeScript declarations:

```bash
pnpm run pack:release
node scripts/consumer-smoke.mjs release-artifacts
```

## Release Checklist

### Versioning

Use the same release line as the backend Stackline AI packages.

1. Update the package manifest, changelog, workspace references, and documentation together.
2. Run the workspace checks plus `pnpm audit` and `pnpm audit --prod`.
3. Use [publish.yml](https://github.com/alexandroit/ai/actions/workflows/publish.yml) and confirm `expected_manifest_sha512` against the reviewed `SHA512SUMS` file.
4. Verify each public package's exact bytes and GitHub Actions provenance.

## License

[MIT](https://github.com/alexandroit/ai/blob/main/packages/ui/LICENSE). Copyright notices and the credits above are retained.

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
