# @stackline/ai-ollama

Ollama provider adapter for Stackline AI.

This package connects the provider-neutral `@stackline/ai` server to a local
Ollama install, Ollama Cloud, or an Ollama-compatible gateway. It keeps provider
details on the backend while the frontend talks only to your application API.

## Highlights

- Provider adapter for the shared `StacklineAIProvider` contract.
- Works with local Ollama at `http://127.0.0.1:11434`.
- Supports backend API keys through the `Authorization: Bearer` header.
- Supports `model: "auto"` by reading `/api/tags`.
- Filters obvious non-chat models when choosing an automatic model.
- Keeps RAG, memory, tools, and frontend UI provider-independent.

## Install

```bash
npm install @stackline/ai @stackline/ai-ollama
```

## Local Ollama

```ts
import { createStacklineAIServer } from "@stackline/ai/server";
import { ollamaProvider } from "@stackline/ai-ollama";

const server = createStacklineAIServer({
  provider: ollamaProvider({
    target: "http://127.0.0.1:11434",
    model: "auto",
  }),
  rag: false,
  memory: false,
});
```

## Gateway Or Cloud Endpoint

Keep endpoint URLs and API keys on the backend.

```ts
const provider = ollamaProvider({
  target: process.env.OLLAMA_TARGET,
  apiKey: process.env.OLLAMA_API_KEY,
  model: process.env.OLLAMA_MODEL || "auto",
});
```

## Model Listing

```ts
const models = await provider.listModels?.();
```

The adapter reads Ollama's `/api/tags` endpoint and returns Stackline model
objects:

```ts
[
  {
    id: "llama3.1:latest",
    name: "llama3.1:latest",
    provider: "ollama"
  }
]
```

## Chat

The adapter normalizes Stackline chat messages into Ollama chat format.

```ts
const response = await server.chat({
  model: "auto",
  messages: [{ role: "user", content: "Write a short summary." }],
});

console.log(response.content);
```

## RAG And Memory

RAG is intentionally not implemented inside this provider. Use `@stackline/ai`
with retriever and memory adapters so the same RAG pipeline can work with
Ollama, OpenAI, Gemini, Claude, Grok, and future providers.

## Community

Questions and discussions:

https://www.reddit.com/r/Stackline/
