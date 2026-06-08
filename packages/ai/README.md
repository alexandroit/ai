# @stackline/ai

Provider-neutral Stackline AI contracts and server core.

`@stackline/ai` is the backend foundation for Stackline AI applications. It
defines the contracts for providers, chat requests, RAG retrieval, memory
stores, model listing, and the server flow that keeps API keys and data access
away from the frontend.

## Highlights

- Provider-neutral AI server core.
- Works with Ollama now and leaves room for OpenAI, Gemini, Claude, Grok, and
  other providers through adapters.
- Optional RAG retrieval with one shared contract.
- Optional conversation memory with safe defaults.
- RAG evidence is visible to the current response but is not persisted by
  default.
- Frontend packages call one backend endpoint instead of exposing provider keys.
- TypeScript-first contracts for senior backend integration.

## Install

```bash
npm install @stackline/ai
```

Install a provider adapter separately. For Ollama:

```bash
npm install @stackline/ai @stackline/ai-ollama
```

## Basic Gateway

Use this mode when you only need a secure backend gateway to one AI provider.
There is no database, RAG store, memory store, migration, or extra driver.

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

const response = await server.chat({
  messages: [{ role: "user", content: "Explain RAG in one paragraph." }],
});

console.log(response.content);
```

## RAG Usage

RAG is implemented in the Stackline AI server, not inside provider adapters.
That keeps every provider using the same retrieval contract.

```ts
const server = createStacklineAIServer({
  provider,
  rag: {
    enabled: true,
    maxContextItems: 4,
    onFailure: "continue",
    retriever: {
      async retrieve(request) {
        return [
          {
            content: "Stackline AI keeps provider adapters separate from RAG.",
            source: "docs:architecture",
            score: 0.92,
            metadata: { section: "architecture" },
          },
        ];
      },
    },
  },
  memory: false,
});
```

## Memory Safety

RAG evidence is returned to the current response so the UI can show sources,
scores, and excerpts. It is not persisted into conversation memory by default.

By default, memory receives:

- clean user messages
- clean assistant responses
- model/session/user metadata
- no RAG context excerpts
- no `stacklineRag*` metadata

Advanced audit environments can opt in explicitly:

```ts
const server = createStacklineAIServer({
  provider,
  rag: { retriever },
  memory: {
    store,
    captureConversation: {
      writeMode: "await",
      includeRagContexts: true,
      includeRagEvidence: true,
    },
  },
});
```

## Contracts

The package exports the shared backend contracts:

- `StacklineAIProvider`
- `StacklineAIModel`
- `StacklineChatRequest`
- `StacklineChatResponse`
- `StacklineRagRetriever`
- `StacklineRagContext`
- `StacklineMemoryStore`
- `StacklineMemoryConfig`
- `StacklineAIServer`

## Suggested Architecture

```txt
frontend UI
  -> your backend route
    -> @stackline/ai server
      -> provider adapter
      -> optional RAG retriever
      -> optional memory store
```

The frontend should never call provider APIs directly when keys or private data
are involved. Keep provider credentials, database access, RAG, memory, and tool
execution on the backend.

## Related Packages

- `@stackline/ai-ollama`: Ollama provider adapter.
- `@stackline/ai-ui`: framework-neutral Studio web component.
- `@stackline/ai-server`: HTTP handler helpers.
- `@stackline/ai-memory-sqlite`: local SQLite memory store.
- `@stackline/ai-rag-postgres`: PostgreSQL RAG retriever.

## Community

Questions and discussions:

https://www.reddit.com/r/Stackline/
