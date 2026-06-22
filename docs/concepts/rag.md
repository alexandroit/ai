# RAG

RAG retrievers implement `StacklineRagRetriever`.

```ts
interface StacklineRagRetriever {
  retrieve(request: StacklineChatRequest): Promise<StacklineRagContext[]>;
}
```

The core prepends retrieved context as a system message and marks it with
`metadata.stacklineRagContext: true`. Provider adapters do not need to know
which database or store produced the context.

If a context includes `answer`, the core can return that answer directly.

