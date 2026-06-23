# UI Guide

`@stackline/ai-ui` renders the browser Studio. It does not call Ollama
directly and it does not hold credentials.

## Required Path

```text
Browser
  -> <stackline-ai-studio>
  -> GET /api/ai/models
  -> POST /api/ai/chat
  -> @stackline/ai-server
  -> @stackline/ai
  -> provider adapter
```

## Install By Situation

### Existing Compatible Backend

```bash
npm install @stackline/ai-ui
```

Use this only if `/api/ai/models` and `/api/ai/chat` already exist.

### Full UI With Ollama

Use this when you want the Studio component to work from a new project:

```bash
npm init -y
npm pkg set type=module
npm install @stackline/ai @stackline/ai-server @stackline/ai-ollama @stackline/ai-ui
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

## Backend Must Work First

Before rendering the UI, verify:

```bash
curl http://127.0.0.1:8787/api/ai/models
curl http://127.0.0.1:8787/api/ai/chat \
  -H 'content-type: application/json' \
  -d '{"model":"llama3.1","messages":[{"role":"user","content":"Hello"}]}'
```

## Use

```js
import "@stackline/ai-ui";
```

```html
<stackline-ai-studio
  endpoint="/api/ai/chat"
  models-endpoint="/api/ai/models"
  model="llama3.1"
  theme="material"
></stackline-ai-studio>
```

## Languages

The Studio ships with `en`, `pt`, `fr`, and `es`, but the picker is not limited
to those languages.

HTML-only setup:

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
      "send": "Senden"
    }
  }'
></stackline-ai-studio>
```

JavaScript setup:

```js
const studio = document.querySelector("stackline-ai-studio");

studio.setLanguages([
  { id: "en", label: "EN", nativeName: "English" },
  { id: "pt", label: "PT", nativeName: "Português" },
  { id: "ja", label: "JA", nativeName: "日本語" }
]);

studio.loadTranslations = async (language) => {
  const response = await fetch(`/i18n/${language}.json`);
  return response.ok ? response.json() : null;
};

studio.setLanguage("ja");
```

Use `setTranslations({ send: "Ask" })` for a one-off active-language override,
or `setTranslationPacks({ de: { send: "Senden" } })` for many languages.

## Events

```js
const studio = document.querySelector("stackline-ai-studio");

studio.addEventListener("stackline-response", (event) => {
  console.log(event.detail.content);
});

studio.addEventListener("stackline-error", (event) => {
  console.error(event.detail.error);
});
```

## Expected Backend Schemas

Models:

```json
{
  "models": [
    { "id": "llama3.1", "name": "llama3.1", "provider": "ollama" }
  ]
}
```

Chat:

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

## Model Troubleshooting

If the server returns:

```text
Ollama chat requires a model. Use a model name or model: "auto".
```

run:

```bash
ollama list
```

Then use the exact model in both backend and UI:

```bash
OLLAMA_MODEL=llama3.1
```

```html
<stackline-ai-studio model="llama3.1"></stackline-ai-studio>
```
