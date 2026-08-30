# @stackline/ai-rag-postgres

> Read-only PostgreSQL RAG retriever for Stackline AI, using parameterized SQL, stable views, row mapping, tenant-safe query hooks, and backend-only database credentials.

[![npm version](https://img.shields.io/npm/v/@stackline/ai-rag-postgres.svg?style=flat-square)](https://www.npmjs.com/package/@stackline/ai-rag-postgres)
[![npm monthly](https://img.shields.io/npm/dm/@stackline/ai-rag-postgres.svg?style=flat-square)](https://www.npmjs.com/package/@stackline/ai-rag-postgres)
[![license](https://img.shields.io/npm/l/@stackline/ai-rag-postgres.svg?style=flat-square)](https://github.com/alexandroit/ai/blob/main/LICENSE)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-RAG-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Reddit community](https://img.shields.io/badge/community-r%2FStackline-ff4500?style=flat-square&logo=reddit&logoColor=white)](https://www.reddit.com/r/Stackline/)

**[Documentation & Live Demos](https://alexandro.net/docs/ai/)** | **[npm](https://www.npmjs.com/package/@stackline/ai-rag-postgres)** | **[Issues](https://github.com/alexandroit/ai/issues)** | **[Repository](https://github.com/alexandroit/ai)** | **[Community Discussions](https://www.reddit.com/r/Stackline/)**

**Latest tested package release:** `0.0.4`

---

> **Credits:** Stackline AI package architecture, publishing, and documentation by [Alexandro Paixao Marques](https://github.com/alexandroit).

---

## Why this package?

`@stackline/ai-rag-postgres` gives Stackline AI a database retrieval layer without tying the provider to PostgreSQL. The core receives normalized `StacklineRagContext[]`, so the same provider/UI path works with or without RAG.

## Features

| Feature | Supported |
| :--- | :---: |
| PostgreSQL connection string | ✅ |
| Existing client/pool support | ✅ |
| Parameterized SQL helper | ✅ |
| Custom query callback | ✅ |
| Custom row mapping | ✅ |
| Minimum query length | ✅ |
| Result limit | ✅ |
| Read-only view friendly | ✅ |
| TypeScript declarations | ✅ |

## Table of Contents

1. [Why this package?](#why-this-package)
2. [Features](#features)
3. [Status](#status)
4. [Where This Fits](#where-this-fits)
5. [Install By Situation](#install-by-situation)
6. [Database Shape](#database-shape)
7. [Complete Integration](#complete-integration)
8. [Prove RAG Is Used](#prove-rag-is-used)
9. [Public API](#public-api)
10. [Query Contract](#query-contract)
11. [Row Mapping](#row-mapping)
12. [Security](#security)

## Status

Initial public API, ESM-only, TypeScript declarations included.

## Where This Fits

This package is backend-only retrieval. It reads context from PostgreSQL and
returns `StacklineRagContext[]` to `@stackline/ai`.

Runtime path:

```text
Browser UI
  -> @stackline/ai-server
  -> @stackline/ai
  -> @stackline/ai-rag-postgres retrieves context
  -> provider receives context as a system message
```

The browser should never receive database URLs, SQL, or tenant filters.

## Install By Situation

### RAG Retriever Only

Use this when you are wiring PostgreSQL retrieval into an existing Stackline
backend.

```bash
npm init -y
npm pkg set type=module
npm install @stackline/ai @stackline/ai-rag-postgres
```

The PostgreSQL runtime and declaration packages are resolved through reviewed
Stackline compatibility forks. Existing imports from `pg` and the public API of
this package do not change.

### Full UI App With Ollama And PostgreSQL RAG

```bash
npm init -y
npm pkg set type=module
npm install @stackline/ai @stackline/ai-server @stackline/ai-ollama @stackline/ai-ui @stackline/ai-rag-postgres
npm install -D vite
mkdir -p src sql
```

Add to `.env`:

```bash
STACKLINE_AI_RAG=true
RAG_DATABASE_URL=postgres://readonly_user:password@127.0.0.1:5432/app
RAG_MIN_QUERY_LENGTH=2
RAG_LIMIT=4
```

## Requirements

- Runtime: Node.js `>=18.17.0`.
- PostgreSQL connection string or compatible query client.
- Read-only SQL query or custom `query` function.

## When To Use

Use this package when your RAG context can be read from PostgreSQL tables,
views, or tenant-filtered queries.

## When Not To Use

Do not use it as a vector database replacement. The current package is lexical
SQL retrieval unless you provide your own SQL/ranking.

## Database Shape

A stable view is the simplest production contract:

```sql
create table if not exists documents (
  id text primary key,
  title text not null,
  content text not null,
  source text,
  metadata jsonb default '{}'::jsonb,
  updated_at timestamptz default now()
);

create or replace view stackline_ai_rag_view as
select id, title, content, source, metadata, updated_at
from documents;
```

Grant the application a read-only user for this view.

## Complete Integration

```js
import { createStacklineAIServer } from "@stackline/ai/server";
import { createPostgresRagRetriever } from "@stackline/ai-rag-postgres";
import { ollamaProvider } from "@stackline/ai-ollama";

const retriever = createPostgresRagRetriever({
  connectionString: process.env.RAG_DATABASE_URL,
  sql: `
    select id, title, content, source, metadata, 100 as score
    from stackline_ai_rag_view
    where content ilike $1 or title ilike $1
    order by updated_at desc
    limit $2
  `,
  minQueryLength: 2,
  limit: 4,
});

const ai = createStacklineAIServer({
  provider: ollamaProvider({
    target: process.env.OLLAMA_TARGET || "http://127.0.0.1:11434",
    model: process.env.OLLAMA_MODEL || "auto",
  }),
  rag: {
    retriever,
    maxContextItems: 4,
    onFailure: "continue",
  },
  memory: false,
});

process.on("SIGINT", async () => {
  await retriever.close();
  process.exit(0);
});
```

Use `@stackline/ai-server` to expose this `ai` instance over HTTP.

## Prove RAG Is Used

Seed:

```sql
insert into documents (id, title, content, source, metadata)
values (
  'apollo',
  'Apollo Project',
  'Apollo is the internal codename for the Stackline AI starter project.',
  'seed:apollo',
  '{"kind":"demo"}'
);
```

Ask:

```json
{
  "model": "llama3.1",
  "messages": [
    { "role": "user", "content": "What is Apollo in this database?" }
  ]
}
```

The provider receives a prepended system message containing the retrieved
context. The HTTP response metadata includes RAG evidence under
`message.metadata.stacklineRag`.

## Public API

- `createPostgresRagRetriever(options)`
- `StacklinePostgresRagRetrieverOptions`
- `StacklinePostgresQuery`
- `StacklinePostgresQueryable`

## Options

- `connectionString`
- `connection`
- `client`
- `sql`
- `query`
- `mapRow`
- `limit`
- `minQueryLength`

## Query Contract

With `sql`, Stackline supplies:

```js
values: [`%${query}%`, limit]
```

For advanced filters, use `query({ query, request, limit })`:

```js
createPostgresRagRetriever({
  connectionString: process.env.RAG_DATABASE_URL,
  query: ({ query, request, limit }) => ({
    text: `
      select id, title, content, source, metadata, 100 as score
      from stackline_ai_rag_view
      where tenant_id = $1 and (content ilike $2 or title ilike $2)
      order by updated_at desc
      limit $3
    `,
    values: [request.metadata?.tenantId, `%${query}%`, limit],
  }),
});
```

## Row Mapping

Default mapping prefers `content`, `text`, `body`, or `description`. Provide
`mapRow` for domain-specific metadata:

```js
createPostgresRagRetriever({
  connectionString: process.env.RAG_DATABASE_URL,
  sql: "select title, body, url, rank as score from docs where body ilike $1 limit $2",
  mapRow: (row) => ({
    content: row.body,
    source: row.url,
    score: row.score,
    metadata: { title: row.title },
  }),
});
```

## Test The Example

```bash
pnpm --filter stackline-ai-example-postgres-rag smoke
```

## Security

Use read-only database users, stable views, tenant filters, and parameterized
queries. Do not expose SQL or connection strings to browsers.

## Limitations

No embeddings are implemented in this package line. Add embeddings in SQL or a
separate retriever when needed.

## Versioning

Use the same release line as `@stackline/ai`.

## License

MIT

## Documentation

- Full tutorial: `docs/getting-started/full-stack-tutorial.md`
- Production guide: `docs/guides/production.md`
