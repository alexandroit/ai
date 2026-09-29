# @stackline/ai-memory-sqlite

> SQLite conversation memory store for Stackline AI development and tests.

[![npm version](https://img.shields.io/npm/v/@stackline/ai-memory-sqlite.svg?style=flat-square)](https://www.npmjs.com/package/@stackline/ai-memory-sqlite)
[![license](https://img.shields.io/npm/l/@stackline/ai-memory-sqlite.svg?style=flat-square)](https://github.com/alexandroit/ai)
[![GitHub repository](https://img.shields.io/badge/GitHub-alexandroit%2Fai-181717?style=flat-square&logo=github)](https://github.com/alexandroit/ai)
[![Docs](https://img.shields.io/badge/docs-alexandro.net-0f766e?style=flat-square)](https://alexandro.net/docs/ai/)
[![Reddit community](https://img.shields.io/badge/community-r%2FStackline-ff4500?style=flat-square&logo=reddit&logoColor=white)](https://www.reddit.com/r/Stackline/)

**[Documentation](https://alexandro.net/docs/ai/)** | **[npm](https://www.npmjs.com/package/@stackline/ai-memory-sqlite)** | **[Issues](https://github.com/alexandroit/ai/issues)** | **[Repository](https://github.com/alexandroit/ai)**

**Current package version:** `0.0.5`

---

## Why this package?

`@stackline/ai-memory-sqlite` gives Stackline AI a local persistence layer without requiring a database server. It is designed for development, smoke tests, demos, and small private deployments where a single backend instance writes conversation memory.

### Where This Fits

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

### When To Use

Use this package for local development, smoke tests, prototypes, and
single-instance deployments that need simple persisted conversation memory.

## Compatibility

| Item | Value |
| --- | --- |
| Package | `@stackline/ai-memory-sqlite@0.0.5` |
| Supported Node.js | `>=18.17.0` |
| Module entry | `dist/index.js` (ES modules) |
| Types | `dist/index.d.ts` |
| Runtime dependencies | 2 direct dependencies |

### Status

Initial public API, ESM-only, TypeScript declarations included.

### Requirements

- Runtime: Node.js `>=18.17.0`.
- Writable filesystem path for the SQLite file.
- A Stackline AI core created with `createStacklineAIServer`.

### When Not To Use

Do not use it as the default for horizontally scaled production systems. Use a
server database-backed memory store for multi-instance deployments.

### Limitations

This package is not a distributed memory service. Plan backups, retention, and
tenant isolation before production use.

## Installation

### Install By Situation

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

## Usage

### Complete Integration

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

### Prove Persistence

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

## Security

RAG contexts and RAG metadata are not stored by default. Opt in with
`storeRagContexts` and `storeRagMetadata` only when your policy allows it.

## API Surface

### Public API

- `createSqliteMemoryStore(options)`
- `StacklineSqliteMemoryStoreOptions`

### Options

- `path`
- `indexAssistantResponses`
- `indexUserMessages`
- `storeRagContexts`
- `storeRagMetadata`

### Logical Schema

The store creates:

- `ai_sessions`
- `ai_interactions`
- `ai_messages`
- `ai_retrievals`
- `ai_memories`

### Persistence

The parent folder is created automatically. The sql.js database is exported to
the configured `path` after writes and migrations.

### Search

`store.search(query, { limit })` searches indexed memory content and returns
`StacklineRagContext[]`.

### Closing

Call `close()` during shutdown.

### Documentation

- Full tutorial: `docs/getting-started/full-stack-tutorial.md`
- Production guide: `docs/guides/production.md`

## Local Development

Clone the [monorepo](https://github.com/alexandroit/ai) and run from its root. Repository tooling requires Node.js `>=22.13.0` and `pnpm@11.22.0`; release archives use official Node.js `24.20.0` and npm `11.19.0`.

```bash
pnpm install --frozen-lockfile
pnpm --filter @stackline/ai-memory-sqlite build
pnpm --filter @stackline/ai-memory-sqlite test
pnpm run check
```

## Consumer Smoke Test

### Test The Example

```bash
pnpm --filter stackline-ai-example-sqlite-memory smoke
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

[MIT](https://github.com/alexandroit/ai/blob/main/packages/memory-sqlite/LICENSE). Copyright notices and the credits above are retained.

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
