# @stackline/ai

> Provider-neutral Stackline AI contracts and backend core for model listing, chat orchestration, RAG context injection, memory capture, provider adapters, and HTTP/UI integrations.

[![npm version](https://img.shields.io/npm/v/@stackline/ai.svg?style=flat-square)](https://www.npmjs.com/package/@stackline/ai)
[![npm monthly](https://img.shields.io/npm/dm/@stackline/ai.svg?style=flat-square)](https://www.npmjs.com/package/@stackline/ai)
[![license](https://img.shields.io/npm/l/@stackline/ai.svg?style=flat-square)](https://github.com/alexandroit/ai/blob/master/LICENSE)
[![Node](https://img.shields.io/badge/Node-%3E%3D18.17.0-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Reddit community](https://img.shields.io/badge/community-r%2FStackline-ff4500?style=flat-square&logo=reddit&logoColor=white)](https://www.reddit.com/r/Stackline/)

**[Documentation & Live Demos](https://alexandro.net/docs/ai/)** | **[npm](https://www.npmjs.com/package/@stackline/ai)** | **[Issues](https://github.com/alexandroit/ai/issues)** | **[Repository](https://github.com/alexandroit/ai)** | **[Community Discussions](https://www.reddit.com/r/Stackline/)**

**Latest tested package release:** `0.0.2`

---

> **Credits:** Stackline AI package architecture, publishing, and documentation by [Alexandro Paixao Marques](https://github.com/alexandroit).

---

## Why this package?

`@stackline/ai` is the core contract package. It deliberately does not open an HTTP port and does not render UI. It coordinates providers, optional RAG retrieval, and optional memory capture so every framework or runtime can share the same backend behavior.

## Features

| Feature | Supported |
| :--- | :---: |
| Provider-neutral chat contract | ✅ |
| Model listing contract | ✅ |
| RAG context injection | ✅ |
| Direct RAG answers | ✅ |
| Memory capture hooks | ✅ |
| Backend/server integration | ✅ |
| TypeScript declarations | ✅ |
| ESM-only package | ✅ |

## Table of Contents

1. [Why this package?](#why-this-package)
2. [Features](#features)
3. [Status](#status)
4. [What This Package Does](#what-this-package-does)
5. [Install By Situation](#install-by-situation)
6. [Minimal Provider Test](#minimal-provider-test)
7. [Ollama Path](#ollama-path)
8. [Public API](#public-api)
9. [Main Types](#main-types)
10. [Configuration](#configuration)
11. [Request Contract](#request-contract)
12. [Response Contract](#response-contract)
13. [Security](#security)

## Status

Initial public API, ESM-only, TypeScript declarations included.

## What This Package Does

This package is the core orchestration layer. It does not open an HTTP port and
it does not render a UI.

It connects:

```text
provider adapter -> chat/listModels
RAG retriever    -> optional context before provider call
memory store     -> optional persistence after response
```

Use `@stackline/ai-server` to expose it as HTTP and `@stackline/ai-ui` to render
the browser Studio.

## Install By Situation

### Core Only

Use this for custom providers, direct `ai.chat()` tests, and library
integrations without HTTP or UI.

```bash
npm init -y
npm pkg set type=module
npm install @stackline/ai
```

### Core With Ollama

```bash
npm init -y
npm pkg set type=module
npm install @stackline/ai @stackline/ai-ollama
```

### Core With HTTP And Ollama

```bash
npm init -y
npm pkg set type=module
npm install @stackline/ai @stackline/ai-server @stackline/ai-ollama
```

### Full UI App

```bash
npm init -y
npm pkg set type=module
npm install @stackline/ai @stackline/ai-server @stackline/ai-ollama @stackline/ai-ui
npm install -D vite
mkdir -p src
```

## Requirements

- Runtime: Node.js `>=18.17.0`.
- Repository development: Node.js `>=22.13.0`.
- ESM project (`"type": "module"`).

## When To Use

Use this package when you need a provider-neutral backend core for chat, model
listing, RAG orchestration, and optional memory capture.

## When Not To Use

Do not use it directly in browser code. Browser apps should call your backend
route and optionally render `@stackline/ai-ui`.

## Minimal Provider Test

This does not need Ollama. It verifies the core contract.

```js
import { createStacklineAIServer } from "@stackline/ai";

const provider = {
  name: "fake",
  capabilities: () => ({
    streaming: false,
    tools: false,
    vision: false,
    embeddings: false,
    modelListing: true,
    jsonMode: false,
    structuredOutput: false,
  }),
  listModels: async () => [{ id: "fake-chat", provider: "fake" }],
  chat: async (request) => ({
    role: "assistant",
    content: `Echo: ${request.messages.at(-1)?.content || ""}`,
    model: request.model || "fake-chat",
  }),
};

const ai = createStacklineAIServer({
  provider,
  rag: false,
  memory: false,
});

console.log(await ai.listModels());

const response = await ai.chat({
  model: "fake-chat",
  messages: [{ role: "user", content: "hello" }],
});

console.log(response.content);
```

## Ollama Path

```js
import { createStacklineAIServer } from "@stackline/ai/server";
import { ollamaProvider } from "@stackline/ai-ollama";

const model = process.env.OLLAMA_MODEL || "llama3.1";
if (!model.trim()) throw new Error("OLLAMA_MODEL is empty.");

const ai = createStacklineAIServer({
  provider: ollamaProvider({
    target: process.env.OLLAMA_TARGET || "http://127.0.0.1:11434",
    model,
  }),
  rag: false,
  memory: false,
});
```

Expose it with `@stackline/ai-server` before using the browser UI.

## Public API

```js
import { createStacklineAIServer } from "@stackline/ai";
import { createStacklineAIServer } from "@stackline/ai/server";
```

Both imports are valid exported paths.

## Main Types

- `StacklineAIProvider`
- `StacklineAIProviderCapabilities`
- `StacklineAIModel`
- `StacklineChatRequest`
- `StacklineChatResponse`
- `StacklineRagRetriever`
- `StacklineRagContext`
- `StacklineMemoryStore`
- `StacklineMemoryInteraction`
- `StacklineAIServer`
- `StacklineAIServerConfig`

## Configuration

```js
createStacklineAIServer({
  provider,
  rag: false,
  memory: false,
});
```

RAG can be enabled with:

```js
createStacklineAIServer({
  provider,
  rag: {
    retriever,
    maxContextItems: 4,
    onFailure: "continue",
  },
  memory: false,
});
```

Memory can be enabled with:

```js
createStacklineAIServer({
  provider,
  rag: false,
  memory: {
    store,
    captureConversation: {
      writeMode: "await",
      mode: "both",
    },
  },
});
```

## Request Contract

```json
{
  "model": "llama3.1",
  "messages": [
    { "role": "user", "content": "Hello" }
  ],
  "metadata": {
    "sessionId": "demo-session",
    "userId": "user-1"
  }
}
```

## Response Contract

```json
{
  "role": "assistant",
  "content": "Hello.",
  "model": "llama3.1",
  "metadata": {}
}
```

When RAG returns contexts, the core prepends a provider-neutral `system`
message with retrieved material. RAG evidence is returned in response metadata.

## Error Handling

The core does not convert errors to HTTP. Provider, RAG, and memory errors are
thrown to the caller. `@stackline/ai-server` converts them to JSON HTTP errors.

## Package Integration

- Provider: `@stackline/ai-ollama`.
- HTTP: `@stackline/ai-server`.
- UI: `@stackline/ai-ui`.
- Memory: `@stackline/ai-memory-sqlite`.
- RAG: `@stackline/ai-rag-postgres`.

## Test The Example

```bash
pnpm --filter stackline-ai-example-ollama-minimal smoke
```

## Troubleshooting

- If a provider receives RAG context, it appears as a prepended `system`
  message with `metadata.stacklineRagContext: true`.
- If a RAG context has `answer`, the provider may not be called.
- RAG evidence is response metadata and is not persisted by default.
- If Ollama throws `Ollama chat requires a model...`, fix provider/UI model
  configuration in `@stackline/ai-ollama` and `@stackline/ai-ui`.

## Security

Keep providers, database access, memory paths, and RAG retrievers on the
backend. Treat retrieved RAG context as untrusted supporting material.

## Limitations

- Streaming is part of the provider contract but is not exposed by the current
  HTTP package.
- The core does not implement authentication, authorization, rate limiting, or
  persistence by itself.

## Versioning

This package follows semver. Keep adapter and server packages on compatible
Stackline AI release lines.

## License

MIT

## Documentation

- Full tutorial: `docs/getting-started/full-stack-tutorial.md`
- API reference: `docs/reference/packages.md`
