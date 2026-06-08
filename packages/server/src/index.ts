import type {
  StacklineAIMessage,
  StacklineAIServer,
  StacklineChatRequest,
} from "@stackline/ai";

export interface StacklineAICorsOptions {
  origins?: "*" | string[];
  headers?: string[];
  methods?: string[];
  credentials?: boolean;
}

export interface StacklineAIHttpHandlerOptions {
  server: StacklineAIServer;
  basePath?: string;
  cors?: StacklineAICorsOptions;
  allowedModels?: string[];
  maxBodyBytes?: number;
}

export type StacklineAIHttpHandler = (request: Request) => Promise<Response>;

interface ChatPayload {
  model?: unknown;
  messages?: unknown;
  temperature?: unknown;
  metadata?: unknown;
}

const DEFAULT_BASE_PATH = "/api/ai";
const DEFAULT_MAX_BODY_BYTES = 256 * 1024;
const DEFAULT_METHODS = ["GET", "POST", "OPTIONS"];
const DEFAULT_HEADERS = ["content-type"];
const ROLES = new Set(["system", "user", "assistant", "tool"]);

function json(data: unknown, init: ResponseInit = {}, corsHeaders?: Headers): Response {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  corsHeaders?.forEach((value, key) => headers.set(key, value));
  return new Response(JSON.stringify(data), { ...init, headers });
}

function error(status: number, message: string, corsHeaders?: Headers): Response {
  return json({ error: { message, status } }, { status }, corsHeaders);
}

function normalizeBasePath(basePath: string | undefined): string {
  if (basePath === undefined) return DEFAULT_BASE_PATH;
  const value = basePath.trim();
  if (!value || value === "/") return "";
  return `/${value.replace(/^\/+|\/+$/g, "")}`;
}

function routeFor(request: Request, basePath: string): string | null {
  const path = new URL(request.url).pathname;
  if (basePath && path !== basePath && !path.startsWith(`${basePath}/`)) return null;
  const route = basePath ? path.slice(basePath.length) : path;
  return route || "/";
}

function corsFor(request: Request, cors: StacklineAICorsOptions | undefined): Headers {
  const headers = new Headers();
  if (!cors) return headers;

  const origin = request.headers.get("origin");
  if (cors.origins === "*") {
    headers.set("access-control-allow-origin", "*");
  } else if (origin && cors.origins?.includes(origin)) {
    headers.set("access-control-allow-origin", origin);
    headers.set("vary", "Origin");
  }

  headers.set("access-control-allow-methods", (cors.methods ?? DEFAULT_METHODS).join(", "));
  headers.set("access-control-allow-headers", (cors.headers ?? DEFAULT_HEADERS).join(", "));
  if (cors.credentials) headers.set("access-control-allow-credentials", "true");
  return headers;
}

async function readJson(request: Request, maxBodyBytes: number): Promise<ChatPayload> {
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > maxBodyBytes) {
    throw new Error(`Request body is larger than ${maxBodyBytes} bytes.`);
  }
  if (!text.trim()) return {};
  return JSON.parse(text) as ChatPayload;
}

function normalizeMessages(value: unknown): StacklineAIMessage[] {
  if (!Array.isArray(value)) throw new Error("messages must be an array.");
  return value.map((item, index) => {
    if (!item || typeof item !== "object") {
      throw new Error(`messages[${index}] must be an object.`);
    }
    const message = item as Record<string, unknown>;
    if (typeof message.role !== "string" || !ROLES.has(message.role)) {
      throw new Error(`messages[${index}].role is invalid.`);
    }
    if (typeof message.content !== "string") {
      throw new Error(`messages[${index}].content must be a string.`);
    }
    return {
      role: message.role as StacklineAIMessage["role"],
      content: message.content,
      name: typeof message.name === "string" ? message.name : undefined,
      metadata:
        message.metadata && typeof message.metadata === "object"
          ? (message.metadata as Record<string, unknown>)
          : undefined,
    };
  });
}

function normalizeChatRequest(payload: ChatPayload): StacklineChatRequest {
  return {
    model: typeof payload.model === "string" ? payload.model : undefined,
    messages: normalizeMessages(payload.messages),
    temperature: typeof payload.temperature === "number" ? payload.temperature : undefined,
    metadata:
      payload.metadata && typeof payload.metadata === "object"
        ? (payload.metadata as Record<string, unknown>)
        : undefined,
  };
}

function assertAllowedModel(model: string | undefined, allowedModels: string[] | undefined): void {
  if (!model || !allowedModels?.length) return;
  if (!allowedModels.includes(model)) throw new Error(`Model "${model}" is not allowed.`);
}

export function createStacklineAIHttpHandler(
  options: StacklineAIHttpHandlerOptions,
): StacklineAIHttpHandler {
  const basePath = normalizeBasePath(options.basePath);
  const maxBodyBytes = options.maxBodyBytes ?? DEFAULT_MAX_BODY_BYTES;

  return async function handleStacklineAIRequest(request) {
    const corsHeaders = corsFor(request, options.cors);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

    const route = routeFor(request, basePath);
    if (!route) return error(404, "Stackline AI route not found.", corsHeaders);

    try {
      if (request.method === "GET" && route === "/health") {
        return json({ ok: true, mode: options.server.mode() }, undefined, corsHeaders);
      }

      if (request.method === "GET" && route === "/manifest") {
        return json(
          {
            name: "Stackline AI",
            mode: options.server.mode(),
            routes: ["GET /health", "GET /manifest", "GET /models", "POST /chat"],
          },
          undefined,
          corsHeaders,
        );
      }

      if (request.method === "GET" && route === "/models") {
        return json({ models: await options.server.listModels() }, undefined, corsHeaders);
      }

      if (request.method === "POST" && route === "/chat") {
        const payload = await readJson(request, maxBodyBytes);
        const chatRequest = normalizeChatRequest(payload);
        assertAllowedModel(chatRequest.model, options.allowedModels);
        const message = await options.server.chat(chatRequest);
        return json({ message, content: message.content, model: message.model }, undefined, corsHeaders);
      }

      return error(404, "Stackline AI route not found.", corsHeaders);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Unexpected Stackline AI server error.";
      const status = message.includes("not allowed") ? 403 : 400;
      return error(status, message, corsHeaders);
    }
  };
}
