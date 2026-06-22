# @stackline/ai-memory-sqlite

> SQLite/sql.js conversation memory store for Stackline AI development, tests, local assistants, private demos, and single-instance deployments that need persisted chat history.

[![npm version](https://img.shields.io/npm/v/@stackline/ai-memory-sqlite.svg?style=flat-square)](https://www.npmjs.com/package/@stackline/ai-memory-sqlite)
[![npm monthly](https://img.shields.io/npm/dm/@stackline/ai-memory-sqlite.svg?style=flat-square)](https://www.npmjs.com/package/@stackline/ai-memory-sqlite)
[![license](https://img.shields.io/npm/l/@stackline/ai-memory-sqlite.svg?style=flat-square)](https://github.com/alexandroit/ai/blob/master/LICENSE)
[![SQLite](https://img.shields.io/badge/SQLite-memory-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://www.sqlite.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Reddit community](https://img.shields.io/badge/community-r%2FStackline-ff4500?style=flat-square&logo=reddit&logoColor=white)](https://www.reddit.com/r/Stackline/)

**[Documentation & Live Demos](https://alexandro.net/docs/ai/)** | **[npm](https://www.npmjs.com/package/@stackline/ai-memory-sqlite)** | **[Issues](https://github.com/alexandroit/ai/issues)** | **[Repository](https://github.com/alexandroit/ai)** | **[Community Discussions](https://www.reddit.com/r/Stackline/)**

**Latest tested package release:** `0.0.2`

---

> **Credits:** Stackline AI package architecture, publishing, and documentation by [Alexandro Paixao Marques](https://github.com/alexandroit).

---

## Why this package?

`@stackline/ai-memory-sqlite` gives Stackline AI a local persistence layer without requiring a database server. It is designed for development, smoke tests, demos, and small private deployments where a single backend instance writes conversation memory.

## Features

| Feature | Supported |
| :--- | :---: |
| SQLite/sql.js persistence | ✅ |
| Automatic schema migration | ✅ |
| Session and user metadata | ✅ |
| User message indexing | ✅ |
| Assistant response indexing | ✅ |
| Optional RAG context storage | ✅ |
| Search returning `StacklineRagContext[]` | ✅ |
| Graceful close hook | ✅ |

## Table of Contents

1. [Why this package?](#why-this-package)
2. [Features](#features)
3. [Status](#status)
4. [Where This Fits](#where-this-fits)
5. [Install By Situation](#install-by-situation)
6. [Complete Integration](#complete-integration)
7. [Prove Persistence](#prove-persistence)
8. [Public API](#public-api)
9. [Options](#options)
10. [Logical Schema](#logical-schema)
11. [Security](#security)

## Status

Initial public API, ESM-only, TypeScript declarations included.

## Where This Fits

This package is backend-only memory storage. It is not the UI, not an HTTP
server, and not a provider.

Runtime path:

```text
Browser UI
  -> @stackline/ai-server
  -> @stackline/ai
  -> provider response
  -> @stackline/ai-memory-sqlite saves interaction
```

The browser should never know the SQLite path.

## Install By Situation

### Memory Store Only

Use this when you are wiring memory into an existing Stackline backend.

```bash
npm init -y
npm pkg set type=module
npm install @stackline/ai @stackline/ai-memory-sqlite
mkdir -p data
```

### Full UI App With Ollama And SQLite Memory

```bash
npm init -y
npm pkg set type=module
npm install @stackline/ai @stackline/ai-server @stackline/ai-ollama @stackline/ai-ui @stackline/ai-memory-sqlite
npm install -D vite
mkdir -p data src
```

Add to `.env`:

```bash
STACKLINE_AI_MEMORY=true
STACKLINE_AI_MEMORY_PATH=./data/memory.sqlite
```

## Requirements

- Runtime: Node.js `>=18.17.0`.
- Writable filesystem path for the SQLite file.
- A Stackline AI core created with `createStacklineAIServer`.

## When To Use

Use this package for local development, smoke tests, prototypes, and
single-instance deployments that need simple persisted conversation memory.

## When Not To Use

Do not use it as the default for horizontally scaled production systems. Use a
server database-backed memory store for multi-instance deployments.

## Complete Integration

```js
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createStacklineAIServer } from "@stackline/ai/server";
import { createSqliteMemoryStore } from "@stackline/ai-memory-sqlite";
import { ollamaProvider } from "@stackline/ai-ollama";

const memoryPath = resolve(process.env.STACKLINE_AI_MEMORY_PATH || "./data/memory.sqlite");
mkdirSync(dirname(memoryPath), { recursive: true });

const memory = createSqliteMemoryStore({
  path: memoryPath,
  indexAssistantResponses: true,
  indexUserMessages: true,
});

const ai = createStacklineAIServer({
  provider: ollamaProvider({
    target: process.env.OLLAMA_TARGET || "http://127.0.0.1:11434",
    model: process.env.OLLAMA_MODEL || "auto",
  }),
  rag: false,
  memory: {
    store: memory,
    captureConversation: {
      writeMode: "await",
      mode: "both",
    },
  },
});

process.on("SIGINT", async () => {
  memory.close();
  process.exit(0);
});
```

Use `@stackline/ai-server` to expose this `ai` instance over HTTP.

## Prove Persistence

Send a chat request with metadata:

```json
{
  "model": "llama3.1",
  "messages": [
    { "role": "user", "content": "Remember that my test project is Apollo." }
  ],
  "metadata": {
    "sessionId": "session-1",
    "userId": "user-1"
  }
}
```

Restart the server. The SQLite file remains at `STACKLINE_AI_MEMORY_PATH`.
Searchable entries are written to `ai_memories` when indexing is enabled.

## Public API

- `createSqliteMemoryStore(options)`
- `StacklineSqliteMemoryStoreOptions`

## Options

- `path`
- `indexAssistantResponses`
- `indexUserMessages`
- `storeRagContexts`
- `storeRagMetadata`

## Logical Schema

The store creates:

- `ai_sessions`
- `ai_interactions`
- `ai_messages`
- `ai_retrievals`
- `ai_memories`

## Persistence

The parent folder is created automatically. The sql.js database is exported to
the configured `path` after writes and migrations.

## Search

`store.search(query, { limit })` searches indexed memory content and returns
`StacklineRagContext[]`.

## Closing

Call `close()` during shutdown.

## Test The Example

```bash
pnpm --filter stackline-ai-example-sqlite-memory smoke
```

## Security

RAG contexts and RAG metadata are not stored by default. Opt in with
`storeRagContexts` and `storeRagMetadata` only when your policy allows it.

## Limitations

This package is not a distributed memory service. Plan backups, retention, and
tenant isolation before production use.

## Versioning

Use the same release line as `@stackline/ai`.

## License

MIT

## Documentation

- Full tutorial: `docs/getting-started/full-stack-tutorial.md`
- Production guide: `docs/guides/production.md`
