# Stackline AI Architecture

## Frontend

Frontend packages should render UI and talk to one backend endpoint.

Planned packages:

- `@stackline/ai-react`
- `@stackline/ai-angular`
- `@stackline/ai-vue`
- `@stackline/ai-vanilla`

The frontend must not know whether the backend uses Ollama, Gemini, OpenAI,
Claude, or Grok.

## Backend

Backend packages own provider secrets, RAG, memory, sources, stores, tools,
security, migrations, and observability.

Started packages:

- `@stackline/ai`
- `@stackline/ai-server`
- `@stackline/ai-ollama`
- `@stackline/ai-ui`

Planned provider adapters:

- `@stackline/ai-openai`
- `@stackline/ai-gemini`
- `@stackline/ai-anthropic`
- `@stackline/ai-xai`

Planned store adapters:

- `@stackline/ai-store-sqlite`
- `@stackline/ai-store-postgres`
- `@stackline/ai-store-mysql`
- `@stackline/ai-store-sqlserver`
- `@stackline/ai-store-qdrant`
- `@stackline/ai-store-redis`

## Basic Mode

When `rag: false` and `memory: false`, Stackline AI should behave like the
current secure gateway: no database, no migrations, no RAG store, no memory
store, and only the selected provider adapter installed.

The basic full-stack shape is:

```txt
frontend
  <stackline-ai-studio>
       |
       v
backend
  @stackline/ai-server
       |
       v
core
  @stackline/ai
       |
       v
provider adapter
  @stackline/ai-ollama
```

The UI does not know provider secrets or provider-specific APIs.

## RAG Mode

When RAG is enabled, RAG is provider-independent:

1. Normalize user messages.
2. Retrieve RAG/memory context.
3. Compose a provider-neutral chat request.
4. Call the selected provider.
5. Optionally capture question/answer into memory or RAG after the response.

Provider adapters should not implement RAG. They only translate the normalized
request to their provider API.

## How Providers Use RAG

Every AI provider uses RAG through the same server contract:

```txt
User request
  -> Stackline AI server
  -> optional retriever/store lookup
  -> provider-neutral messages with Stackline RAG context
  -> selected provider adapter
  -> provider API
```

The provider adapter receives a normal `StacklineChatRequest`. When RAG is
enabled, the server prepends a `system` message marked with
`metadata.stacklineRagContext: true`. The adapter does not know whether the
context came from SQLite, Postgres, SQL Server, MySQL/MariaDB, Qdrant, Redis, a
view, a file, or captured conversation memory.

Provider-specific behavior stays isolated:

- Ollama maps the normalized request to `/api/chat`.
- OpenAI will map the normalized request to the OpenAI chat/responses API.
- Gemini will map the normalized request to the Gemini generate content API.
- Anthropic will map the normalized request to Claude messages.
- xAI will map the normalized request to Grok-compatible chat APIs.

The RAG contract remains the same for all of them. This keeps RAG, memory,
source readers, and database stores from being rewritten for every AI engine.

## Storage Direction

Read connectors and write stores should be explicit contracts:

- source readers fetch existing business data from views, SQL queries, files,
  APIs, or search indexes;
- RAG stores write normalized chunks, embeddings, source metadata, timestamps,
  tenant/user metadata, and retrieval scores;
- memory stores can optionally capture question/answer pairs, user/session
  identity, timestamps, and labels;
- migrations/schema checks run only when `rag` or `memory` is enabled.

When `rag: false` and `memory: false`, none of these storage paths are required.
