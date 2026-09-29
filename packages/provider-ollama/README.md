# @stackline/ai-ollama

> Ollama provider adapter for Stackline AI.

[![npm version](https://img.shields.io/npm/v/@stackline/ai-ollama.svg?style=flat-square)](https://www.npmjs.com/package/@stackline/ai-ollama)
[![license](https://img.shields.io/npm/l/@stackline/ai-ollama.svg?style=flat-square)](https://github.com/alexandroit/ai)
[![GitHub repository](https://img.shields.io/badge/GitHub-repository-181717?style=flat-square&logo=github)](https://github.com/alexandroit/ai)
[![Docs](https://img.shields.io/badge/docs-alexandro.net-0f766e?style=flat-square)](https://alexandro.net/docs/ai/)
[![Reddit community](https://img.shields.io/badge/community-r%2FStackline-ff4500?style=flat-square&logo=reddit&logoColor=white)](https://www.reddit.com/r/Stackline/)

**[Documentation](https://alexandro.net/docs/ai/)** | **[npm](https://www.npmjs.com/package/@stackline/ai-ollama)** | **[Issues](https://github.com/alexandroit/ai/issues)** | **[Repository](https://github.com/alexandroit/ai)**

**Current package version:** `0.0.6`

---

## Why this package?

`@stackline/ai-ollama` keeps Ollama behind your backend while still giving Stackline UI and HTTP packages a provider-neutral interface. It documents the full model path because Ollama `/api/chat` requires a real model name.

### What This Package Does

This package adapts local Ollama, Ollama Cloud, or an Ollama-compatible API to
the provider contract from `@stackline/ai`.

It is backend code. Do not put Ollama Cloud keys in browser code.

### When To Use

Use this package when Stackline AI should call local Ollama, Ollama Cloud, or an
Ollama-compatible backend.

## Compatibility

| Item | Value |
| --- | --- |
| Package | `@stackline/ai-ollama@0.0.6` |
| Supported Node.js | `>=18.17.0` |
| Module entry | `dist/index.js` (ES modules) |
| Types | `dist/index.d.ts` |
| Runtime dependencies | 1 direct dependency |

### Status

Initial public API, ESM-only, TypeScript declarations included.

### Requirements

- Runtime: Node.js `>=18.17.0`.
- Ollama or an Ollama-compatible API.
- At least one installed chat model, unless every request supplies a valid
  explicit model.

### When Not To Use

Do not import this package in the browser for private deployments. It belongs
behind `@stackline/ai-server`.

### Limitations

The adapter sends `stream: false`. Provider capabilities report streaming, but
the current HTTP package does not expose streaming routes.

## Installation

### Install By Situation

### Ollama Provider Only

Use this when backend code calls `ai.chat()` directly and you do not need HTTP
or UI yet.

```bash
npm init -y
npm pkg set type=module
npm install @stackline/ai @stackline/ai-ollama
```

### Ollama Through HTTP Routes

Use this when you need `/api/ai/models` and `/api/ai/chat`.

```bash
npm init -y
npm pkg set type=module
npm install @stackline/ai @stackline/ai-server @stackline/ai-ollama
```

### Ollama With The Browser Studio UI

Use this when you want `<stackline-ai-studio>` to work.

```bash
npm init -y
npm pkg set type=module
npm install @stackline/ai @stackline/ai-server @stackline/ai-ollama @stackline/ai-ui
npm install -D vite
mkdir -p src
```

## Usage

### Step 1: Validate Ollama Before Stackline

```bash
ollama --version
ollama list
ollama pull llama3.1
curl http://127.0.0.1:11434/api/tags
```

Direct chat test:

```bash
curl http://127.0.0.1:11434/api/chat \
  -H 'content-type: application/json' \
  -d '{
    "model": "llama3.1",
    "messages": [
      { "role": "user", "content": "Reply with one short sentence." }
    ],
    "stream": false
  }'
```

If `llama3.1` is not installed, use the exact `NAME` shown by `ollama list`.

### Step 2: Use An Explicit Model First

Explicit models are the safest first deployment because they make failures
obvious.

```js
import { createStacklineAIServer } from "@stackline/ai/server";
import { ollamaProvider } from "@stackline/ai-ollama";

const model = process.env.OLLAMA_MODEL || "llama3.1";
if (!model.trim()) throw new Error("OLLAMA_MODEL is empty.");

const ai = createStacklineAIServer({
  provider: ollamaProvider({
    target: process.env.OLLAMA_TARGET || "http://127.0.0.1:11434",
    apiKey: process.env.OLLAMA_API_KEY,
    model,
  }),
  rag: false,
  memory: false,
});

const response = await ai.chat({
  model,
  messages: [{ role: "user", content: "Say hello." }],
});

console.log(response.content);
```

### Step 3: Expose It Through The Server

```js
import { createStacklineAIHttpHandler } from "@stackline/ai-server";

const handleAI = createStacklineAIHttpHandler({
  server: ai,
  basePath: "/api/ai",
  allowedModels: [model],
});
```

Then the browser UI can call:

```html
<stackline-ai-studio
  endpoint="/api/ai/chat"
  models-endpoint="/api/ai/models"
  model="llama3.1"
></stackline-ai-studio>
```

### `model: "auto"`

The provider also supports:

```js
ollamaProvider({
  target: "http://127.0.0.1:11434",
  model: "auto",
});
```

Auto mode calls `/api/tags`, skips model names that look like image, embedding,
rerank, or vision-only models, and caches the first likely chat model. If no
model can be resolved, chat throws:

```text
Ollama chat requires a model. Use a model name or model: "auto".
```

Use explicit models when debugging a first install. Use `auto` when you want
the backend to select the first installed chat-like model.

## Features

| Feature | Supported |
| :--- | :---: |
| Local Ollama target | ✅ |
| Ollama-compatible API target | ✅ |
| Optional API key header | ✅ |
| Explicit model selection | ✅ |
| `model: "auto"` fallback | ✅ |
| `/api/tags` model listing | ✅ |
| Non-chat model filtering for auto mode | ✅ |
| TypeScript declarations | ✅ |

## Security

Keep `apiKey` on the backend. Use model allow-lists in `@stackline/ai-server`
when exposing a public app.

## API Surface

### Public API

- `ollamaProvider(options?: OllamaProviderOptions)`
- `OllamaProviderOptions`

### Options

- `target`: defaults to `http://127.0.0.1:11434`.
- `apiKey`: optional bearer token.
- `model`: explicit model or `"auto"`.
- `fetch`: optional fetch implementation for tests or custom runtimes.

### Model Empty Troubleshooting

Symptom:

```text
Ollama chat requires a model. Use a model name or model: "auto".
```

Cause:

- `request.model` was empty;
- provider `options.model` was empty;
- or `model: "auto"` could not resolve an installed model from `/api/tags`.

Fix:

```bash
ollama list
```

Copy the exact `NAME`, then set:

```bash
OLLAMA_MODEL=llama3.1
```

Use the same value in UI markup when you want the browser to send it:

```html
<stackline-ai-studio model="llama3.1"></stackline-ai-studio>
```

### Error Handling

Non-OK Ollama responses include the upstream error text when possible.

### Integration

Use with:

- `@stackline/ai` for provider-neutral orchestration;
- `@stackline/ai-server` for safe backend HTTP routes;
- `@stackline/ai-ui` for the browser Studio component.

### Documentation

- Full tutorial: `docs/getting-started/full-stack-tutorial.md`
- Package reference: `docs/reference/packages.md`

## Local Development

Clone the [monorepo](https://github.com/alexandroit/ai) and run from its root. Repository tooling requires Node.js `>=22.13.0` and `pnpm@11.22.0`; release archives use official Node.js `24.20.0` and npm `11.19.0`.

```bash
pnpm install --frozen-lockfile
pnpm --filter @stackline/ai-ollama build
pnpm --filter @stackline/ai-ollama test
pnpm run check
```

## Consumer Smoke Test

### Test The Example

```bash
pnpm --filter stackline-ai-example-ollama-minimal smoke
```

Pack the release family and validate a fresh consumer, including runtime exports and TypeScript declarations:

```bash
pnpm run pack:release
node scripts/consumer-smoke.mjs release-artifacts
```

## Release Checklist

### Versioning

Use the same release line as `@stackline/ai`.

1. Update the package manifest, changelog, workspace references, and documentation together.
2. Run the workspace checks plus `pnpm audit` and `pnpm audit --prod`.
3. Use [publish.yml](https://github.com/alexandroit/ai/actions/workflows/publish.yml) and confirm `expected_manifest_sha512` against the reviewed `SHA512SUMS` file.
4. Verify each public package's exact bytes and GitHub Actions provenance.

## License

[MIT](https://github.com/alexandroit/ai/blob/main/packages/provider-ollama/LICENSE). Copyright notices and the credits above are retained.

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
