import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import initSqlJs from "sql.js";
import type {
  StacklineMemoryInteraction,
  StacklineMemoryStore,
  StacklineRagContext,
} from "@stackline/ai";

interface SqlJsDatabase {
  run(sql: string, params?: unknown[]): void;
  exec(sql: string): Array<{ columns: string[]; values: unknown[][] }>;
  export(): Uint8Array;
  close(): void;
}

interface SqlJsStatic {
  Database: new (data?: Uint8Array) => SqlJsDatabase;
}

export interface StacklineSqliteMemoryStoreOptions {
  path: string;
  indexAssistantResponses?: boolean;
  indexUserMessages?: boolean;
  storeRagContexts?: boolean;
  storeRagMetadata?: boolean;
}

function json(value: unknown): string {
  return JSON.stringify(value ?? null);
}

function latestMessageContent(interaction: StacklineMemoryInteraction, role: "user" | "assistant"): string {
  if (role === "assistant") return interaction.response.content;
  const message = [...interaction.request.messages].reverse().find((item) => item.role === "user");
  return message?.content ?? "";
}

function sanitizeMetadata(metadata: Record<string, unknown> | undefined): Record<string, unknown> | undefined {
  if (!metadata) return undefined;
  const clean = Object.fromEntries(
    Object.entries(metadata).filter(([key]) => !key.startsWith("stacklineRag")),
  );
  return Object.keys(clean).length ? clean : undefined;
}

function sanitizeInteractionForStorage(
  interaction: StacklineMemoryInteraction,
  options: StacklineSqliteMemoryStoreOptions,
): StacklineMemoryInteraction {
  if (options.storeRagContexts && options.storeRagMetadata) return interaction;
  const responseMetadata = options.storeRagMetadata ? interaction.response.metadata : sanitizeMetadata(interaction.response.metadata);
  return {
    ...interaction,
    response: {
      ...interaction.response,
      ...(responseMetadata ? { metadata: responseMetadata } : { metadata: undefined }),
    },
    contexts: options.storeRagContexts ? interaction.contexts : [],
  };
}

function sqlLike(value: string): string {
  return `%${value.replace(/[%_]/g, (char) => `\\${char}`)}%`;
}

export function createSqliteMemoryStore(
  options: StacklineSqliteMemoryStoreOptions,
): StacklineMemoryStore & { close(): void } {
  let sqlPromise: Promise<SqlJsStatic> | null = null;
  let db: SqlJsDatabase | null = null;
  let migrated = false;

  async function getSql(): Promise<SqlJsStatic> {
    sqlPromise ??= initSqlJs() as Promise<SqlJsStatic>;
    return sqlPromise;
  }

  async function getDb(): Promise<SqlJsDatabase> {
    if (db) return db;
    const SQL = await getSql();
    db = existsSync(options.path) ? new SQL.Database(readFileSync(options.path)) : new SQL.Database();
    return db;
  }

  function persist(database: SqlJsDatabase): void {
    mkdirSync(dirname(options.path), { recursive: true });
    writeFileSync(options.path, database.export());
  }

  async function migrate(): Promise<void> {
    if (migrated) return;
    const database = await getDb();
    database.run(`
      create table if not exists ai_sessions (
        id text primary key,
        user_id text,
        created_at text not null,
        updated_at text not null,
        metadata_json text
      );

      create table if not exists ai_interactions (
        id integer primary key autoincrement,
        session_id text,
        user_id text,
        model text,
        request_json text not null,
        response_json text not null,
        contexts_json text,
        created_at text not null,
        metadata_json text
      );

      create table if not exists ai_messages (
        id integer primary key autoincrement,
        session_id text,
        interaction_id integer,
        role text not null,
        content text not null,
        model text,
        created_at text not null,
        metadata_json text
      );

      create table if not exists ai_retrievals (
        id integer primary key autoincrement,
        session_id text,
        interaction_id integer,
        source text,
        content text not null,
        score real,
        created_at text not null,
        metadata_json text
      );

      create table if not exists ai_memories (
        id integer primary key autoincrement,
        session_id text,
        source text,
        content text not null,
        score real,
        created_at text not null,
        metadata_json text
      );

      create index if not exists idx_ai_messages_session on ai_messages(session_id);
      create index if not exists idx_ai_retrievals_session on ai_retrievals(session_id);
      create index if not exists idx_ai_memories_session on ai_memories(session_id);
    `);
    persist(database);
    migrated = true;
  }

  async function saveInteraction(interaction: StacklineMemoryInteraction): Promise<void> {
    await migrate();
    interaction = sanitizeInteractionForStorage(interaction, options);
    const database = await getDb();
    const createdAt = (interaction.createdAt ?? new Date()).toISOString();
    const sessionId = interaction.sessionId ?? "default";
    const userId = interaction.userId ?? null;
    const model = interaction.model ?? interaction.response.model ?? interaction.request.model ?? null;

    database.run(
      `
      insert into ai_sessions (id, user_id, created_at, updated_at, metadata_json)
      values (?, ?, ?, ?, ?)
      on conflict(id) do update set
        user_id = excluded.user_id,
        updated_at = excluded.updated_at,
        metadata_json = excluded.metadata_json
      `,
      [sessionId, userId, createdAt, createdAt, json(interaction.metadata)],
    );

    database.run(
      `
      insert into ai_interactions
        (session_id, user_id, model, request_json, response_json, contexts_json, created_at, metadata_json)
      values (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        sessionId,
        userId,
        model,
        json(interaction.request),
        json(interaction.response),
        json(interaction.contexts ?? []),
        createdAt,
        json(interaction.metadata),
      ],
    );

    const interactionId = Number(
      database.exec("select last_insert_rowid() as id")[0]?.values[0]?.[0] ?? 0,
    );

    const userContent = latestMessageContent(interaction, "user");
    const assistantContent = latestMessageContent(interaction, "assistant");

    for (const [role, content] of [
      ["user", userContent],
      ["assistant", assistantContent],
    ] as const) {
      if (!content.trim()) continue;
      database.run(
        `
        insert into ai_messages
          (session_id, interaction_id, role, content, model, created_at, metadata_json)
        values (?, ?, ?, ?, ?, ?, ?)
        `,
        [sessionId, interactionId, role, content, model, createdAt, json(interaction.metadata)],
      );
    }

    for (const context of interaction.contexts ?? []) {
      database.run(
        `
        insert into ai_retrievals
          (session_id, interaction_id, source, content, score, created_at, metadata_json)
        values (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          sessionId,
          interactionId,
          context.source ?? null,
          context.content,
          context.score ?? null,
          createdAt,
          json(context.metadata),
        ],
      );
    }

    if (options.indexUserMessages && userContent.trim()) {
      database.run(
        "insert into ai_memories (session_id, source, content, score, created_at, metadata_json) values (?, ?, ?, ?, ?, ?)",
        [sessionId, "conversation:user", userContent, null, createdAt, json(interaction.metadata)],
      );
    }

    if (options.indexAssistantResponses !== false && assistantContent.trim()) {
      database.run(
        "insert into ai_memories (session_id, source, content, score, created_at, metadata_json) values (?, ?, ?, ?, ?, ?)",
        [sessionId, "conversation:assistant", assistantContent, null, createdAt, json(interaction.metadata)],
      );
    }

    persist(database);
  }

  async function search(query: string, searchOptions: { limit?: number } = {}): Promise<StacklineRagContext[]> {
    await migrate();
    const database = await getDb();
    const limit = searchOptions.limit ?? 5;
    const rows = database.exec(`
      select source, content, score, metadata_json
      from ai_memories
      where content like '${sqlLike(query).replace(/'/g, "''")}' escape '\\'
      order by id desc
      limit ${Math.max(1, Math.min(50, limit))}
    `);

    const result = rows[0];
    if (!result) return [];

    return result.values.map((row) => ({
      source: row[0] == null ? undefined : String(row[0]),
      content: String(row[1] ?? ""),
      score: typeof row[2] === "number" ? row[2] : undefined,
      metadata: row[3] ? (JSON.parse(String(row[3])) as Record<string, unknown>) : undefined,
    }));
  }

  return {
    migrate,
    saveInteraction,
    search,
    close() {
      db?.close();
      db = null;
      migrated = false;
    },
  };
}
