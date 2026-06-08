import { describe, expect, it } from "vitest";
import { createStacklineAIServer, type StacklineAIProvider } from "../src";

function provider(): { calls: unknown[]; provider: StacklineAIProvider } {
  const calls: unknown[] = [];
  return {
    calls,
    provider: {
      name: "test",
      capabilities: () => ({
        streaming: false,
        tools: false,
        vision: false,
        embeddings: false,
        modelListing: false,
        jsonMode: false,
        structuredOutput: false,
      }),
      async chat(request) {
        calls.push(request);
        return { role: "assistant", content: "ok" };
      },
      async listModels() {
        return [{ id: "test-model", provider: "test" }];
      },
    },
  };
}

describe("createStacklineAIServer", () => {
  it("keeps the basic mode provider-only when rag and memory are false", async () => {
    const setup = provider();
    const server = createStacklineAIServer({
      provider: setup.provider,
      rag: false,
      memory: false,
    });

    await server.chat({ messages: [{ role: "user", content: "hello" }] });

    expect(server.mode()).toEqual({
      provider: "test",
      ragEnabled: false,
      memoryEnabled: false,
    });
    expect(setup.calls).toHaveLength(1);
    expect(setup.calls[0]).toMatchObject({
      messages: [{ role: "user", content: "hello" }],
    });
    await expect(server.listModels()).resolves.toEqual([{ id: "test-model", provider: "test" }]);
  });

  it("injects RAG context before calling the provider", async () => {
    const setup = provider();
    const server = createStacklineAIServer({
      provider: setup.provider,
      rag: {
        retriever: {
          async retrieve() {
            return [{ content: "Project policy: answer briefly.", source: "policy-view" }];
          },
        },
      },
    });

    await server.chat({ messages: [{ role: "user", content: "hello" }] });

    expect(setup.calls[0]).toMatchObject({
      messages: [
        {
          role: "system",
          metadata: { stacklineRagContext: true },
        },
        { role: "user", content: "hello" },
      ],
    });
  });

  it("returns RAG source metadata with the assistant response", async () => {
    const setup = provider();
    const server = createStacklineAIServer({
      provider: setup.provider,
      rag: {
        retriever: {
          async retrieve() {
            return [
              {
                content: "Artist: Demo Artist\nSong: Demo Song",
                source: "local-catalog:song:1",
                score: 100,
                metadata: { songName: "Demo Song", artistName: "Demo Artist" },
              },
            ];
          },
        },
      },
    });

    await expect(server.chat({ messages: [{ role: "user", content: "Who sings Demo Song?" }] })).resolves.toMatchObject({
      metadata: {
        stacklineRag: {
          enabled: true,
          contextCount: 1,
          sources: [
            {
              source: "local-catalog:song:1",
              score: 100,
              metadata: { songName: "Demo Song", artistName: "Demo Artist" },
            },
          ],
        },
      },
    });
  });

  it("can answer directly from deterministic RAG context without calling the provider", async () => {
    const setup = provider();
    const server = createStacklineAIServer({
      provider: setup.provider,
      rag: {
        retriever: {
          async retrieve() {
            return [
              {
                content: "Artist title list context.",
                source: "local-catalog:artist:demo-rock:titles",
                score: 100,
                metadata: { artistName: "Demo Rock Band", songCount: 2 },
                answer: "## Demo Rock Band titles\n\n1. First Demo Track\n2. Second Demo Track",
              },
            ];
          },
        },
      },
    });

    await expect(server.chat({ messages: [{ role: "user", content: "all Demo Rock Band titles" }] })).resolves.toMatchObject({
      content: "## Demo Rock Band titles\n\n1. First Demo Track\n2. Second Demo Track",
      model: "stackline-rag",
      metadata: {
        stacklineRag: {
          enabled: true,
          contextCount: 1,
          sources: [{ source: "local-catalog:artist:demo-rock:titles" }],
        },
      },
    });
    expect(setup.calls).toHaveLength(0);
  });

  it("falls back to RAG results when the provider returns empty content", async () => {
    const calls: unknown[] = [];
    const server = createStacklineAIServer({
      provider: {
        name: "empty-provider",
        capabilities: () => ({
          streaming: false,
          tools: false,
          vision: false,
          embeddings: false,
          modelListing: false,
          jsonMode: false,
          structuredOutput: false,
        }),
        async chat(request) {
          calls.push(request);
          return { role: "assistant", content: "", model: "empty-model" };
        },
      },
      rag: {
        retriever: {
          async retrieve() {
            return [
              {
                content: "Artist: Demo Rock Band\nSong: Demo Anthem",
                source: "local-catalog:song:2",
                score: 100,
                metadata: { artistName: "Demo Rock Band", songName: "Demo Anthem" },
              },
            ];
          },
        },
      },
    });

    await expect(server.chat({ messages: [{ role: "user", content: "Demo Anthem" }] })).resolves.toMatchObject({
      model: "stackline-rag",
      content: expect.stringContaining("| Demo Rock Band | Demo Anthem |"),
      metadata: {
        stacklineRagFallback: true,
        stacklineRag: {
          enabled: true,
          contextCount: 1,
        },
      },
    });
    expect(calls).toHaveLength(1);
  });

  it("saves chat interactions to memory when a memory store is provided", async () => {
    const setup = provider();
    const saved: unknown[] = [];
    const server = createStacklineAIServer({
      provider: setup.provider,
      rag: {
        retriever: {
          async retrieve() {
            return [{ content: "Known context.", source: "test-context" }];
          },
        },
      },
      memory: {
        store: {
          async saveInteraction(interaction) {
            saved.push(interaction);
          },
        },
        captureConversation: {
          writeMode: "await",
        },
      },
    });

    await server.chat({
      model: "test-model",
      messages: [{ role: "user", content: "hello" }],
      metadata: { sessionId: "s1", userId: "u1" },
    });

    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({
      sessionId: "s1",
      userId: "u1",
      request: {
        model: "test-model",
        messages: [{ role: "user", content: "hello" }],
      },
      response: { role: "assistant", content: "ok" },
      contexts: [],
    });
    expect((saved[0] as { response?: { metadata?: Record<string, unknown> } }).response?.metadata).toBeUndefined();
  });
});
