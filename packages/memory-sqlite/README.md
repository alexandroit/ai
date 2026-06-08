# @stackline/ai-memory-sqlite

SQLite conversation memory store for Stackline AI.

Use this package when you want a local, file-based memory store for development,
tests, demos, and small private deployments. It implements the shared
`StacklineMemoryStore` contract from `@stackline/ai`.

## Highlights

- Local SQLite memory store powered by `sql.js`.
- Auto-migrates the database on first use.
- Records sessions, interactions, user messages, assistant messages, and
  optional searchable memory rows.
- Removes `stacklineRag*` evidence metadata by default.
- Does not store retrieved RAG contexts by default.
- Keeps the same memory contract that production stores can implement with
  PostgreSQL, SQL Server, MySQL, MariaDB, or another tested backend.

## Install

```bash
npm install @stackline/ai @stackline/ai-memory-sqlite
```

## Basic Usage

```ts
import { createStacklineAIServer } from "@stackline/ai/server";
import { createSqliteMemoryStore } from "@stackline/ai-memory-sqlite";

const memory = createSqliteMemoryStore({
  path: "./data/stackline-ai-memory.sqlite",
  indexAssistantResponses: true,
  indexUserMessages: false,
});

const server = createStacklineAIServer({
  provider,
  rag: false,
  memory: {
    store: memory,
    captureConversation: {
      writeMode: "await",
    },
  },
});
```

## Safe Defaults

RAG evidence is display-time data. It can contain source ids, scores, excerpts,
lyrics, documents, or private context. This package does not store that evidence
unless you opt in.

Default behavior:

- `storeRagContexts: false`
- `storeRagMetadata: false`
- `contexts_json` is stored as `[]`
- `ai_retrievals` receives no rows
- `stacklineRag*` metadata is stripped before persistence

## Audit Opt-In

Only enable audit storage in controlled environments where saving retrieved
context is intentional.

```ts
const memory = createSqliteMemoryStore({
  path: "./data/stackline-ai-memory.sqlite",
  indexAssistantResponses: true,
  storeRagContexts: true,
  storeRagMetadata: true,
});
```

## Search

The store can search indexed conversation memories.

```ts
const results = await memory.search?.("customer refund policy", {
  limit: 5,
});
```

Search returns `StacklineRagContext[]`, so stored memories can be reused by the
same RAG pipeline when your application enables memory recall.

## When To Use

Use SQLite memory when:

- you need quick local persistence;
- you are testing RAG and memory flows;
- you want a simple private demo;
- you want to prototype before moving to a production database.

For large production workloads, keep the `StacklineMemoryStore` contract and use
a server database adapter.

## Community

Questions and discussions:

https://www.reddit.com/r/Stackline/
