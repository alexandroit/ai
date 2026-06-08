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
export type StacklineChatEvent = {
    type: "start";
    model?: string;
} | {
    type: "delta";
    content: string;
} | {
    type: "done";
    response?: StacklineChatResponse;
} | {
    type: "error";
    error: Error;
};
export interface StacklineAIModel {
    id: string;
    name?: string;
    provider?: string;
    metadata?: Record<string, unknown>;
}
export interface StacklineEmbedRequest {
    model?: string;
    input: string | string[];
}
export interface StacklineEmbeddingResult {
    model?: string;
    dimensions?: number;
    embeddings: number[][];
    raw?: unknown;
}
export interface StacklineAIProviderCapabilities {
    streaming: boolean;
    tools: boolean;
    vision: boolean;
    embeddings: boolean;
    modelListing: boolean;
    jsonMode: boolean;
    structuredOutput: boolean;
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
export interface StacklineRagContext {
    content: string;
    source?: string;
    score?: number;
    metadata?: Record<string, unknown>;
}
export interface StacklineRagRetriever {
    retrieve(request: StacklineChatRequest): Promise<StacklineRagContext[]>;
}
export interface StacklineMemoryInteraction {
    sessionId?: string;
    userId?: string;
    request: StacklineChatRequest;
    response: StacklineChatResponse;
    contexts?: StacklineRagContext[];
    model?: string;
    createdAt?: Date;
    metadata?: Record<string, unknown>;
}
export interface StacklineMemoryStore {
    migrate?(): Promise<void>;
    saveInteraction(interaction: StacklineMemoryInteraction): Promise<void>;
    search?(query: string, options?: {
        limit?: number;
    }): Promise<StacklineRagContext[]>;
}
export interface StacklineRagConfig {
    enabled?: boolean;
    retriever?: StacklineRagRetriever;
    maxContextItems?: number;
    onFailure?: "block" | "continue";
}
export type StacklineRagOption = boolean | StacklineRagConfig;
export interface StacklineMemoryConfig {
    enabled?: boolean;
    store?: StacklineMemoryStore;
    captureConversation?: {
        enabled?: boolean;
        mode?: "memory" | "rag" | "both";
        writeMode?: "background" | "await";
    };
}
export type StacklineMemoryOption = boolean | StacklineMemoryConfig;
export interface StacklineAIServerConfig {
    provider: StacklineAIProvider;
    rag?: StacklineRagOption;
    memory?: StacklineMemoryOption;
}
export interface StacklineAIServerMode {
    provider: string;
    ragEnabled: boolean;
    memoryEnabled: boolean;
}
export interface StacklineAIServer {
    mode(): StacklineAIServerMode;
    listModels(): Promise<StacklineAIModel[]>;
    chat(request: StacklineChatRequest): Promise<StacklineChatResponse>;
}
