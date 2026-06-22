# Providers

Providers implement `StacklineAIProvider`.

```ts
interface StacklineAIProvider {
  name: string;
  defaultModel?: string;
  capabilities(): StacklineAIProviderCapabilities;
  listModels?(): Promise<StacklineAIModel[]>;
  chat(request: StacklineChatRequest): Promise<StacklineChatResponse>;
  streamChat?(request: StacklineChatRequest): AsyncIterable<StacklineChatEvent>;
  embed?(request: StacklineEmbedRequest): Promise<StacklineEmbeddingResult>;
}
```

The provider receives normalized messages. RAG and memory are handled by the
core before and after provider calls.

