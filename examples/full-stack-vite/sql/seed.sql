insert into stackline_ai_documents (id, title, content, source, metadata)
values
  (
    'starter-architecture',
    'Starter architecture',
    'The Stackline AI starter keeps UI code in the browser and provider/RAG/memory code on the backend.',
    'seed:starter-architecture',
    '{"kind":"guide"}'
  )
on conflict (id) do update set
  title = excluded.title,
  content = excluded.content,
  source = excluded.source,
  metadata = excluded.metadata,
  updated_at = now();
