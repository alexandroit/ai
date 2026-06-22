insert into stackline_ai_documents (id, title, content, source, metadata)
values
  (
    'quick-start',
    'Quick start',
    'A Stackline AI app uses a browser UI, a backend HTTP handler, a provider adapter, optional memory, and optional RAG.',
    'seed:quick-start',
    '{"kind":"guide"}'
  ),
  (
    'production',
    'Production boundary',
    'Never expose Ollama, provider API keys, database connection strings, or RAG SQL directly to browser code.',
    'seed:production',
    '{"kind":"security"}'
  )
on conflict (id) do update set
  title = excluded.title,
  content = excluded.content,
  source = excluded.source,
  metadata = excluded.metadata,
  updated_at = now();
