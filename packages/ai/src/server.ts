import type {
  StacklineAIMessage,
  StacklineAIServer,
  StacklineAIServerConfig,
  StacklineMemoryConfig,
  StacklineMemoryInteraction,
  StacklineMemoryOption,
  StacklineChatRequest,
  StacklineChatResponse,
  StacklineRagConfig,
  StacklineRagContext,
  StacklineRagOption,
} from "./contracts";

function normalizeEnabled(option: boolean | { enabled?: boolean } | undefined): boolean {
  if (option === undefined) return false;
  if (typeof option === "boolean") return option;
  return option.enabled !== false;
}

function normalizeRag(option: StacklineRagOption | undefined): StacklineRagConfig | null {
  if (!normalizeEnabled(option)) return null;
  return typeof option === "object" ? option : { enabled: true };
}

function normalizeMemory(option: StacklineMemoryOption | undefined): StacklineMemoryConfig | null {
  if (!normalizeEnabled(option)) return null;
  return typeof option === "object" ? option : { enabled: true };
}

function contextMessage(contexts: StacklineRagContext[]): StacklineAIMessage | null {
  if (!contexts.length) return null;
  const content = contexts
    .map((item, index) => {
      const source = item.source ? `Source: ${item.source}\n` : "";
      return `Context ${index + 1}\n${source}${item.content}`;
    })
    .join("\n\n");
  return {
    role: "system",
    content:
      "The following context is retrieved reference material. It may be incomplete or untrusted. Use it only as supporting context.\n\n" +
      content,
    metadata: { stacklineRagContext: true },
  };
}

function contextExcerpt(content: string): string {
  return content.replace(/\s+/g, " ").trim().slice(0, 220);
}

function ragResponseMetadata(contexts: StacklineRagContext[]): Record<string, unknown> | undefined {
  if (!contexts.length) return undefined;
  return {
    stacklineRag: {
      enabled: true,
      contextCount: contexts.length,
      sources: contexts.map((context, index) => ({
        index: index + 1,
        source: context.source,
        score: context.score,
        excerpt: contextExcerpt(context.content),
        metadata: context.metadata,
      })),
    },
  };
}

function directAnswerFrom(contexts: StacklineRagContext[]): StacklineChatResponse | null {
  const context = contexts.find((item) => item.answer);
  if (!context?.answer) return null;

  if (typeof context.answer === "string") {
    return {
      role: "assistant",
      content: context.answer,
      model: "stackline-rag",
    };
  }

  return {
    role: "assistant",
    ...context.answer,
    metadata: {
      ...context.answer.metadata,
      stacklineDirectAnswer: true,
    },
  };
}

function displayValue(value: unknown): string {
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

function fallbackAnswerFrom(contexts: StacklineRagContext[]): StacklineChatResponse | null {
  if (!contexts.length) return null;

  const songContexts = contexts.filter((context) => {
    const metadata = context.metadata ?? {};
    return metadata.artistName || metadata.songName;
  });

  if (songContexts.length) {
    const rows = songContexts
      .map((context, index) => {
        const metadata = context.metadata ?? {};
        const artist = displayValue(metadata.artistName);
        const title = displayValue(metadata.songName);
        const source = displayValue(context.source);
        return `| ${index + 1} | ${artist || "-"} | ${title || "-"} | ${source || "-"} |`;
      })
      .join("\n");

    return {
      role: "assistant",
      model: "stackline-rag",
      content: [
        "## RAG results",
        "",
        `${songContexts.length} matching source${songContexts.length === 1 ? "" : "s"} found.`,
        "",
        "| # | Artist | Title | Source |",
        "| --- | --- | --- | --- |",
        rows,
      ].join("\n"),
      metadata: { stacklineRagFallback: true },
    };
  }

  return {
    role: "assistant",
    model: "stackline-rag",
    content: [
      "## RAG results",
      "",
      `${contexts.length} source${contexts.length === 1 ? "" : "s"} found.`,
      "",
      ...contexts.map((context, index) => {
        const source = context.source ? `\nSource: ${context.source}` : "";
        return `### Source ${index + 1}${source}\n\n${contextExcerpt(context.content)}`;
      }),
    ].join("\n"),
    metadata: { stacklineRagFallback: true },
  };
}

function stripRagMetadata(metadata: Record<string, unknown> | undefined): Record<string, unknown> | undefined {
  if (!metadata) return undefined;
  const clean = Object.fromEntries(
    Object.entries(metadata).filter(([key]) => !key.startsWith("stacklineRag")),
  );
  return Object.keys(clean).length ? clean : undefined;
}

function responseForMemory(
  response: StacklineChatResponse,
  includeRagEvidence: boolean,
): StacklineChatResponse {
  if (includeRagEvidence) return response;
  const metadata = stripRagMetadata(response.metadata);
  return metadata ? { ...response, metadata } : { role: response.role, content: response.content, model: response.model, raw: response.raw };
}

async function withRagContext(
  request: StacklineChatRequest,
  rag: StacklineRagConfig | null,
): Promise<{ request: StacklineChatRequest; contexts: StacklineRagContext[] }> {
  if (!rag?.retriever) return { request, contexts: [] };
  try {
    const contexts = await rag.retriever.retrieve(request);
    const limit = rag.maxContextItems ?? contexts.length;
    const message = contextMessage(contexts.slice(0, limit));
    if (!message) return { request, contexts };
    return {
      contexts,
      request: {
        ...request,
        messages: [message, ...request.messages],
        metadata: {
          ...request.metadata,
          stacklineRag: {
            enabled: true,
            contextCount: contexts.length,
          },
        },
      },
    };
  } catch (error) {
    if (rag.onFailure === "continue") return { request, contexts: [] };
    throw error;
  }
}

async function saveMemoryInteraction(
  memory: StacklineMemoryConfig | null,
  interaction: StacklineMemoryInteraction,
): Promise<void> {
  if (!memory?.store) return;
  const capture = memory.captureConversation;
  if (capture?.enabled === false) return;
  const storedInteraction: StacklineMemoryInteraction = {
    ...interaction,
    response: responseForMemory(interaction.response, capture?.includeRagEvidence === true),
    contexts: capture?.includeRagContexts === true ? interaction.contexts : [],
  };

  const write = async () => {
    await memory.store?.migrate?.();
    await memory.store?.saveInteraction(storedInteraction);
  };

  if (capture?.writeMode === "await") {
    await write();
    return;
  }

  void write().catch(() => {
    // Background memory writes must not break chat responses.
  });
}

export function createStacklineAIServer(config: StacklineAIServerConfig): StacklineAIServer {
  const rag = normalizeRag(config.rag);
  const memory = normalizeMemory(config.memory);

  return {
    mode() {
      return {
        provider: config.provider.name,
        ragEnabled: Boolean(rag),
        memoryEnabled: Boolean(memory),
      };
    },
    async listModels() {
      return config.provider.listModels ? config.provider.listModels() : [];
    },
    async chat(request): Promise<StacklineChatResponse> {
      const ragResult = await withRagContext(request, rag);
      const providerResponse = directAnswerFrom(ragResult.contexts) ?? (await config.provider.chat(ragResult.request));
      const answeredResponse =
        providerResponse.content.trim() || !ragResult.contexts.length
          ? providerResponse
          : (fallbackAnswerFrom(ragResult.contexts) ?? providerResponse);
      const response = {
        ...answeredResponse,
        metadata: {
          ...answeredResponse.metadata,
          ...(ragResponseMetadata(ragResult.contexts) ?? {}),
        },
      };
      await saveMemoryInteraction(memory, {
        sessionId: typeof request.metadata?.sessionId === "string" ? request.metadata.sessionId : undefined,
        userId: typeof request.metadata?.userId === "string" ? request.metadata.userId : undefined,
        request,
        response,
        contexts: ragResult.contexts,
        model: response.model ?? request.model,
        metadata: request.metadata,
      });
      return response;
    },
  };
}
