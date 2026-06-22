# Memory

Memory stores implement `StacklineMemoryStore`.

```ts
interface StacklineMemoryStore {
  migrate?(): Promise<void>;
  saveInteraction(interaction: StacklineMemoryInteraction): Promise<void>;
  search?(query: string, options?: { limit?: number }): Promise<StacklineRagContext[]>;
}
```

The core saves interactions after a response. RAG context and RAG metadata are
not persisted by default. Use `includeRagContexts` and `includeRagEvidence`
only when required by your audit policy.

