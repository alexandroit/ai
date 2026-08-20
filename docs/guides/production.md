# Production Guide

This guide separates development convenience from production requirements.

## Do Not Expose Ollama Directly

Do not expose local Ollama, provider API keys, database URLs, RAG SQL, memory
paths, or model policy directly to browser code. The browser should call your
backend route, and your backend should call Stackline AI packages.

## Required Controls

- Authentication before `/api/ai/*`.
- Authorization per user, tenant, model, and data source.
- Restrictive CORS.
- Rate limiting.
- Request body limits.
- Provider and database timeouts.
- Abort signals for long-running requests.
- Logs without secrets or sensitive prompt contents unless explicitly approved.
- Model allow-lists.
- Read-only PostgreSQL users for RAG.
- Tenant filters inside SQL or views.
- Prompt-injection-aware RAG prompts.
- Memory isolation by `userId` and `sessionId`.
- Retention policies for SQLite/PostgreSQL data.
- Backups for memory/RAG stores.
- Healthchecks and graceful shutdown.
- TLS and a reverse proxy.

## CORS

Development:

```js
cors: { origins: ["http://localhost:4623"] }
```

Production:

```js
cors: { origins: ["https://app.example.com"], credentials: true }
```

## Model Policy

Use `allowedModels` to deny arbitrary model names:

```js
createStacklineAIHttpHandler({
  server: ai,
  allowedModels: ["llama3.1:latest", "qwen2.5:latest"],
});
```

When an allowlist is configured, each chat request must include an explicit
`model`; this prevents a provider default from bypassing the policy.

## PostgreSQL RAG

Use a read-only user and a stable view:

```sql
create view stackline_ai_rag_view as
select id, title, content, source, metadata, updated_at
from stackline_ai_documents
where deleted_at is null;
```

Do not let browser input become SQL text. Use placeholders and values.

## SQLite Memory

SQLite/sql.js is useful for development, tests, local prototypes, and small
single-instance deployments. Avoid it for horizontally scaled production
systems unless you understand locking, persistence, backups, and data loss
risks.

## RAG And Prompt Injection

Retrieved context is supporting material, not trusted instruction. Stackline AI
prepends context as a system message that says the material may be incomplete or
untrusted. Your product should still add domain-specific policy and filtering.
