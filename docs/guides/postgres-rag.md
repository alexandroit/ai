# PostgreSQL RAG Guide

Install:

```bash
npm install @stackline/ai @stackline/ai-rag-postgres
```

Use a read-only view:

```sql
create or replace view stackline_ai_rag_view as
select id, title, content, source, metadata, updated_at
from stackline_ai_documents;
```

Create the retriever:

```js
import { createPostgresRagRetriever } from "@stackline/ai-rag-postgres";

const retriever = createPostgresRagRetriever({
  connectionString: process.env.RAG_DATABASE_URL,
  sql: `
    select id, title, content, source, metadata, 100 as score
    from stackline_ai_rag_view
    where content ilike $1 or title ilike $1
    order by updated_at desc
    limit $2
  `,
  limit: 4,
});
```

Use placeholders. Do not concatenate user input into SQL text.

