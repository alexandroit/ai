import type { PoolConfig, QueryResultRow } from "pg";
import pg from "pg";
import type { StacklineChatRequest, StacklineRagContext, StacklineRagRetriever } from "@stackline/ai";

const { Pool } = pg;

export interface StacklinePostgresQuery {
  text: string;
  values?: unknown[];
}

export interface StacklinePostgresQueryable {
  query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    values?: unknown[],
  ): Promise<{ rows: T[] }>;
  end?(): Promise<void>;
}

export interface StacklinePostgresRagRetrieverOptions<Row extends QueryResultRow = QueryResultRow> {
  connectionString?: string;
  connection?: PoolConfig;
  client?: StacklinePostgresQueryable;
  sql?: string;
  query?: (input: {
    query: string;
    request: StacklineChatRequest;
    limit: number;
  }) => StacklinePostgresQuery;
  mapRow?: (row: Row, index: number) => StacklineRagContext;
  limit?: number;
  minQueryLength?: number;
}

function latestUserText(request: StacklineChatRequest): string {
  const message = [...request.messages].reverse().find((item) => item.role === "user");
  return message?.content.trim() ?? "";
}

function defaultMapRow(row: QueryResultRow, index: number): StacklineRagContext {
  const content =
    row.content ??
    row.text ??
    row.body ??
    row.description ??
    Object.entries(row)
      .map(([key, value]) => `${key}: ${String(value ?? "")}`)
      .join("\n");

  return {
    content: String(content),
    source: row.source ? String(row.source) : `postgres-row:${index + 1}`,
    score: typeof row.score === "number" ? row.score : undefined,
    metadata: row,
  };
}

function createDefaultQuery(sql: string, query: string, limit: number): StacklinePostgresQuery {
  return {
    text: sql,
    values: [`%${query}%`, limit],
  };
}

export function createPostgresRagRetriever<Row extends QueryResultRow = QueryResultRow>(
  options: StacklinePostgresRagRetrieverOptions<Row>,
): StacklineRagRetriever & { close(): Promise<void> } {
  const limit = options.limit ?? 5;
  const minQueryLength = options.minQueryLength ?? 2;
  const client =
    options.client ??
    new Pool({
      connectionString: options.connectionString,
      ...(options.connection ?? {}),
    });

  return {
    async retrieve(request) {
      const query = latestUserText(request);
      if (query.length < minQueryLength) return [];

      const builtQuery = options.query
        ? options.query({ query, request, limit })
        : options.sql
          ? createDefaultQuery(options.sql, query, limit)
          : null;

      if (!builtQuery) {
        throw new Error("PostgreSQL RAG retriever requires either sql or query.");
      }

      const result = await client.query<Row>(builtQuery.text, builtQuery.values ?? []);
      const mapRow = options.mapRow ?? defaultMapRow;
      return result.rows.map((row, index) => mapRow(row, index));
    },
    async close() {
      await client.end?.();
    },
  };
}
