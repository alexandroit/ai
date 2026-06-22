create table if not exists stackline_ai_documents (
  id text primary key,
  title text not null,
  content text not null,
  source text not null,
  metadata jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists idx_stackline_ai_documents_content
  on stackline_ai_documents using gin (to_tsvector('simple', title || ' ' || content));

create or replace view stackline_ai_rag_view as
select
  id,
  title,
  content,
  source,
  metadata,
  updated_at
from stackline_ai_documents;
