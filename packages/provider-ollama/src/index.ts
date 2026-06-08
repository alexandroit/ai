import type {
  StacklineAIModel,
  StacklineAIProvider,
  StacklineChatRequest,
  StacklineChatResponse,
} from "@stackline/ai";

export interface OllamaProviderOptions {
  target?: string;
  apiKey?: string;
  model?: string;
  fetch?: typeof fetch;
}

interface OllamaTagResponse {
  models?: Array<{
    name?: string;
    model?: string;
    [key: string]: unknown;
  }>;
}

interface OllamaChatResponse {
  model?: string;
  message?: {
    role?: string;
    content?: string;
  };
  response?: string;
  [key: string]: unknown;
}

const DEFAULT_TARGET = "http://127.0.0.1:11434";
const AUTO_MODEL = "auto";
const NON_CHAT_MODEL_PATTERNS = [
  /image/i,
  /\bimg\b/i,
  /vision/i,
  /embed/i,
  /embedding/i,
  /rerank/i,
];

function targetUrl(target: string, path: string): URL {
  const url = new URL(target.replace(/\/+$/, ""));
  url.pathname = `${url.pathname.replace(/\/+$/, "")}${path}`;
  return url;
}

function headers(apiKey: string | undefined): Headers {
  const headers = new Headers({ "content-type": "application/json" });
  if (apiKey) headers.set("authorization", `Bearer ${apiKey}`);
  return headers;
}

async function responseErrorMessage(response: Response, label: string): Promise<string> {
  const fallback = `${label} returned HTTP ${response.status}.`;
  const text = await response.text().catch(() => "");
  if (!text.trim()) return fallback;

  try {
    const body = JSON.parse(text) as Record<string, unknown>;
    const message =
      typeof body.error === "string"
        ? body.error
        : body.error && typeof body.error === "object" && "message" in body.error
          ? String((body.error as { message?: unknown }).message)
          : typeof body.message === "string"
            ? body.message
            : typeof body.msg === "string"
              ? body.msg
              : "";
    return message ? `${fallback} ${message}` : `${fallback} ${text.slice(0, 500)}`;
  } catch {
    return `${fallback} ${text.slice(0, 500)}`;
  }
}

function isAutoModel(model: string | undefined): boolean {
  return !model || model.trim().toLowerCase() === AUTO_MODEL;
}

function isLikelyChatModel(model: StacklineAIModel): boolean {
  const id = model.id || model.name || "";
  return !NON_CHAT_MODEL_PATTERNS.some((pattern) => pattern.test(id));
}

function pickAutoModel(models: StacklineAIModel[]): StacklineAIModel | undefined {
  return models.find(isLikelyChatModel) ?? models[0];
}

export function ollamaProvider(options: OllamaProviderOptions = {}): StacklineAIProvider {
  const target = options.target ?? DEFAULT_TARGET;
  const fetchImpl = options.fetch ?? globalThis.fetch;
  if (!fetchImpl) throw new Error("ollamaProvider requires a fetch implementation.");
  let autoModel: string | undefined;

  return {
    name: "ollama",
    defaultModel: options.model,
    capabilities: () => ({
      streaming: true,
      tools: false,
      vision: true,
      embeddings: true,
      modelListing: true,
      jsonMode: true,
      structuredOutput: false,
    }),
    async listModels(): Promise<StacklineAIModel[]> {
      const response = await fetchImpl(targetUrl(target, "/api/tags"), {
        method: "GET",
        headers: headers(options.apiKey),
      });
      if (!response.ok) throw new Error(await responseErrorMessage(response, "Ollama model listing"));
      const body = (await response.json()) as OllamaTagResponse;
      return (body.models ?? []).flatMap((item) => {
        const id = item.name ?? item.model;
        return id ? [{ id, name: id, provider: "ollama", metadata: item }] : [];
      });
    },
    async chat(request: StacklineChatRequest): Promise<StacklineChatResponse> {
      let model = request.model ?? options.model;
      if (isAutoModel(model)) {
        autoModel ??= pickAutoModel(await this.listModels?.() ?? [])?.id;
        model = autoModel;
      }
      if (!model) {
        throw new Error("Ollama chat requires a model. Use a model name or model: \"auto\".");
      }
      const response = await fetchImpl(targetUrl(target, "/api/chat"), {
        method: "POST",
        headers: headers(options.apiKey),
        body: JSON.stringify({
          model,
          messages: request.messages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
          stream: false,
          options:
            request.temperature === undefined ? undefined : { temperature: request.temperature },
        }),
      });
      if (!response.ok) throw new Error(await responseErrorMessage(response, "Ollama chat"));
      const body = (await response.json()) as OllamaChatResponse;
      return {
        role: "assistant",
        content: body.message?.content ?? body.response ?? "",
        model: body.model ?? model,
        raw: body,
      };
    },
  };
}
