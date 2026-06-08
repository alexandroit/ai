# @stackline/ai-rag-postgres

PostgreSQL read-only RAG retriever for Stackline AI.

Use this package to retrieve context from an existing PostgreSQL application
database through safe, parameterized SQL. It implements the shared
`StacklineRagRetriever` contract from `@stackline/ai`.

## Highlights

- Read-only PostgreSQL RAG retrieval.
- Supports `connectionString`, `pg` connection config, or an injected client.
- Uses parameterized queries.
- Maps rows into `StacklineRagContext`.
- Works best against views or materialized views that expose clean RAG fields.
- Keeps provider adapters independent from database logic.

## Install

```bash
npm install @stackline/ai @stackline/ai-rag-postgres
```

## Basic Usage

```ts
import { createStacklineAIServer } from "@stackline/ai/server";
import { createPostgresRagRetriever } from "@stackline/ai-rag-postgres";

const retriever = createPostgresRagRetriever({
  connectionString: process.env.RAG_DATABASE_URL,
  sql: `
    select
      id,
      title,
      body as content,
      source
    from app_rag_documents
    where title ilike $1
       or body ilike $1
    order by updated_at desc
    limit $2
  `,
  mapRow(row) {
    return {
      source: String(row.source ?? `postgres:${row.id}`),
      content: `${row.title}\n${row.content}`,
      metadata: {
        id: row.id,
        title: row.title,
      },
    };
  },
});

const server = createStacklineAIServer({
  provider,
  rag: {
    retriever,
    maxContextItems: 4,
    onFailure: "continue",
  },
  memory: false,
});
```

## Custom Query Builder

Use `query` when the SQL depends on request metadata, tenant, language, or
domain-specific filters.

```ts
const retriever = createPostgresRagRetriever({
  connectionString: process.env.RAG_DATABASE_URL,
  query({ query, request, limit }) {
    return {
      text: `
        select id, title, content
        from app_rag_documents
        where tenant_id = $1
          and content ilike $2
        limit $3
      `,
      values: [request.metadata?.tenantId, `%${query}%`, limit],
    };
  },
});
```

## Recommended Database Shape

For production systems, expose RAG input through a stable view:

```sql
create view app_rag_documents as
select
  id,
  title,
  body,
  source,
  tenant_id,
  updated_at
from documents
where deleted_at is null;
```

Views keep application tables free to evolve while the RAG contract remains
stable.

## Safety Notes

- Prefer read-only database users.
- Prefer views over direct table access.
- Keep tenant and permission filters in SQL.
- Limit returned content length when the source table is large.
- Do not store retrieved context unless your memory/audit policy explicitly
  allows it.

## Community

Questions and discussions:

https://www.reddit.com/r/Stackline/
