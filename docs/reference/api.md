# API Reference

This page summarizes the public TypeScript declarations exposed by the package
entry points. It is based on the generated `dist/*.d.ts` files.

## `@stackline/ai`

```ts
export type StacklineAIRole = "system" | "user" | "assistant" | "tool";

export interface StacklineAIMessage {
  role: StacklineAIRole;
  content: string;
  name?: string;
  metadata?: Record<string, unknown>;
}

export interface StacklineChatRequest {
  model?: string;
  messages: StacklineAIMessage[];
  temperature?: number;
  metadata?: Record<string, unknown>;
}

export interface StacklineChatResponse {
  role: "assistant";
  content: string;
  model?: string;
  raw?: unknown;
  metadata?: Record<string, unknown>;
}

export interface StacklineAIProvider {
  name: string;
  defaultModel?: string;
  capabilities(): StacklineAIProviderCapabilities;
  listModels?(): Promise<StacklineAIModel[]>;
  chat(request: StacklineChatRequest): Promise<StacklineChatResponse>;
  streamChat?(request: StacklineChatRequest): AsyncIterable<StacklineChatEvent>;
  embed?(request: StacklineEmbedRequest): Promise<StacklineEmbeddingResult>;
}

export function createStacklineAIServer(config: StacklineAIServerConfig): StacklineAIServer;
```

## `@stackline/ai-server`

```ts
export interface StacklineAIHttpHandlerOptions {
  server: StacklineAIServer;
  basePath?: string;
  cors?: StacklineAICorsOptions;
  allowedModels?: string[];
  maxBodyBytes?: number;
}

export type StacklineAIHttpHandler = (request: Request) => Promise<Response>;

export function createStacklineAIHttpHandler(
  options: StacklineAIHttpHandlerOptions,
): StacklineAIHttpHandler;
```

## `@stackline/ai-ollama`

```ts
export interface OllamaProviderOptions {
  target?: string;
  apiKey?: string;
  model?: string;
  fetch?: typeof fetch;
}

export function ollamaProvider(options?: OllamaProviderOptions): StacklineAIProvider;
```

## `@stackline/ai-memory-sqlite`

```ts
export interface StacklineSqliteMemoryStoreOptions {
  path: string;
  indexAssistantResponses?: boolean;
  indexUserMessages?: boolean;
  storeRagContexts?: boolean;
  storeRagMetadata?: boolean;
}

export function createSqliteMemoryStore(
  options: StacklineSqliteMemoryStoreOptions,
): StacklineMemoryStore & { close(): void };
```

## `@stackline/ai-rag-postgres`

```ts
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

export function createPostgresRagRetriever<Row extends QueryResultRow = QueryResultRow>(
  options: StacklinePostgresRagRetrieverOptions<Row>,
): StacklineRagRetriever & { close(): Promise<void> };
```

## `@stackline/ai-ui`

```ts
export interface StacklineAIStudioElement extends HTMLElement {
  send(message?: string): Promise<void>;
  setModel(modelId: string): void;
  setLanguage(language: string): void;
  setTranslations(translations: Partial<StacklineAIStudioTranslations> | null): void;
  clear(): void;
  focusComposer(): void;
}

export const stacklineAIStudioTagName = "stackline-ai-studio";
export function defineStacklineAIStudio(win?: Window & typeof globalThis): void;
```
