import { createPostgresRagRetriever } from "@stackline/ai-rag-postgres";

const calls = [];
const client = {
  async query(text, values) {
    calls.push({ text, values });
    return {
      rows: [
        {
          id: "doc-1",
          title: "Stackline AI architecture",
          content: "RAG context is retrieved before the provider receives messages.",
          source: "seed:doc-1",
          score: 100,
        },
      ],
    };
  },
  async end() {},
};

const retriever = createPostgresRagRetriever({
  client,
  sql: `
    select id, title, content, source, 100 as score
    from stackline_ai_documents
    where content ilike $1
    order by updated_at desc
    limit $2
  `,
  limit: 3,
});

const contexts = await retriever.retrieve({
  messages: [{ role: "user", content: "provider messages" }],
});

await retriever.close();

if (!contexts[0]?.content.includes("RAG context")) {
  throw new Error("PostgreSQL RAG example did not map rows into context.");
}

if (calls[0]?.values?.[0] !== "%provider messages%") {
  throw new Error("PostgreSQL RAG example did not use parameterized query values.");
}

console.log("PostgreSQL RAG smoke passed.");
