import { describe, expect, it } from "vitest";
import { createPostgresRagRetriever, type StacklinePostgresQueryable } from "../src";

interface TestRow {
  id: number;
  content: string;
  [key: string]: unknown;
}

describe("createPostgresRagRetriever", () => {
  it("uses a parameterized query and maps rows into contexts", async () => {
    const calls: unknown[] = [];
    const client: StacklinePostgresQueryable = {
      async query<T>(text: string, values?: unknown[]) {
        calls.push({ text, values });
        return { rows: [{ id: 7, content: "hello from postgres" } as T] };
      },
    };
    const retriever = createPostgresRagRetriever<TestRow>({
      client,
      sql: "select * from rag_view where content ilike $1 limit $2",
      limit: 3,
    });

    const contexts = await retriever.retrieve({
      messages: [{ role: "user", content: "hello" }],
    });

    expect(calls).toEqual([
      {
        text: "select * from rag_view where content ilike $1 limit $2",
        values: ["%hello%", 3],
      },
    ]);
    expect(contexts[0]).toMatchObject({
      content: "hello from postgres",
      source: "postgres-row:1",
      metadata: { id: 7 },
    });
  });

  it("returns no context when the query is shorter than minQueryLength", async () => {
    const client: StacklinePostgresQueryable = {
      async query() {
        throw new Error("query should not run");
      },
    };
    const retriever = createPostgresRagRetriever<TestRow>({
      client,
      sql: "select * from rag_view where content ilike $1 limit $2",
      minQueryLength: 3,
    });

    await expect(
      retriever.retrieve({ messages: [{ role: "user", content: "hi" }] }),
    ).resolves.toEqual([]);
  });

  it("fails clearly when neither sql nor query builder is configured", async () => {
    const retriever = createPostgresRagRetriever<TestRow>({
      client: {
        async query() {
          return { rows: [] };
        },
      },
    });

    await expect(
      retriever.retrieve({ messages: [{ role: "user", content: "hello" }] }),
    ).rejects.toThrow("PostgreSQL RAG retriever requires either sql or query.");
  });
});
