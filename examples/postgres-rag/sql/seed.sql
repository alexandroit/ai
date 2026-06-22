insert into stackline_ai_documents (id, title, content, source, metadata)
values
  (
    'architecture',
    'Stackline AI architecture',
    'Stackline AI keeps UI, HTTP server, provider adapters, memory stores, and RAG retrievers separate.',
    'seed:architecture',
    '{"section":"architecture"}'
  ),
  (
    'security',
    'Security boundary',
    'The browser calls your backend. Provider keys, database credentials, SQL, and memory paths stay on the server.',
    'seed:security',
    '{"section":"security"}'
  )
on conflict (id) do update set
  title = excluded.title,
  content = excluded.content,
  source = excluded.source,
  metadata = excluded.metadata,
  updated_at = now();
