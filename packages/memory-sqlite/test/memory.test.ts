import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import initSqlJs from "sql.js";
import { describe, expect, it } from "vitest";
import { createSqliteMemoryStore } from "../src";

interface TestSqlJsDatabase {
  exec(sql: string): Array<{ columns: string[]; values: unknown[][] }>;
  close(): void;
}

interface TestSqlJsStatic {
  Database: new (data?: Uint8Array) => TestSqlJsDatabase;
}

describe("createSqliteMemoryStore", () => {
  it("migrates, saves an interaction, and searches stored memory", async () => {
    const dir = mkdtempSync(join(tmpdir(), "stackline-ai-memory-"));
    const path = join(dir, "memory.sqlite");
    const store = createSqliteMemoryStore({
      path,
      indexAssistantResponses: true,
    });

    try {
      await store.saveInteraction({
        sessionId: "session-1",
        userId: "user-1",
        request: {
          messages: [{ role: "user", content: "who sings this song?" }],
        },
        response: {
          role: "assistant",
          content: "The song is by Test Artist.",
          model: "test-model",
          metadata: {
            stacklineRag: {
              sources: [{ source: "song:1", excerpt: "large RAG evidence" }],
            },
            safeTraceId: "trace-1",
          },
        },
        contexts: [{ source: "song:1", content: "Test Artist - Test Song" }],
      });

      const results = await store.search?.("Test Artist", { limit: 3 });
      expect(results?.[0]).toMatchObject({
        source: "conversation:assistant",
        content: "The song is by Test Artist.",
      });

      const SQL = (await initSqlJs()) as TestSqlJsStatic;
      const database = new SQL.Database(readFileSync(path));
      const interactions = database.exec("select response_json, contexts_json from ai_interactions");
      const [responseJson, contextsJson] = interactions[0]?.values[0] ?? [];
      expect(String(responseJson)).not.toContain("stacklineRag");
      expect(String(responseJson)).toContain("safeTraceId");
      expect(String(contextsJson)).toBe("[]");
      const retrievals = database.exec("select count(*) as total from ai_retrievals");
      expect(retrievals[0]?.values[0]?.[0]).toBe(0);
      database.close();
    } finally {
      store.close();
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
