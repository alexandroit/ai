import { describe, expect, it } from "vitest";
import type { StacklineAIServer } from "@stackline/ai";
import { createStacklineAIHttpHandler } from "../src";

function server(): StacklineAIServer {
  return {
    mode: () => ({ provider: "test", ragEnabled: false, memoryEnabled: false }),
    listModels: async () => [{ id: "demo", provider: "test" }],
    chat: async (request) => ({
      role: "assistant",
      content: `received ${request.messages.at(-1)?.content ?? ""}`,
      model: request.model,
    }),
  };
}

describe("createStacklineAIHttpHandler", () => {
  it("responds to health and model routes", async () => {
    const handle = createStacklineAIHttpHandler({ server: server() });

    await expect(
      handle(new Request("http://localhost/api/ai/health")),
    ).resolves.toMatchObject({ status: 200 });

    const models = await handle(new Request("http://localhost/api/ai/models"));
    await expect(models.json()).resolves.toEqual({
      models: [{ id: "demo", provider: "test" }],
    });
  });

  it("normalizes chat requests and returns provider output", async () => {
    const handle = createStacklineAIHttpHandler({ server: server(), allowedModels: ["demo"] });
    const response = await handle(
      new Request("http://localhost/api/ai/chat", {
        method: "POST",
        body: JSON.stringify({
          model: "demo",
          messages: [{ role: "user", content: "hello" }],
        }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      content: "received hello",
      model: "demo",
    });
  });

  it("blocks models outside the allowlist", async () => {
    const handle = createStacklineAIHttpHandler({ server: server(), allowedModels: ["demo"] });
    const response = await handle(
      new Request("http://localhost/api/ai/chat", {
        method: "POST",
        body: JSON.stringify({
          model: "blocked",
          messages: [{ role: "user", content: "hello" }],
        }),
      }),
    );

    expect(response.status).toBe(403);
  });

  it("supports middleware-mounted handlers without a base path", async () => {
    const handle = createStacklineAIHttpHandler({ server: server(), basePath: "" });
    const response = await handle(new Request("http://localhost/health"));

    expect(response.status).toBe(200);
  });

  it("returns CORS preflight headers", async () => {
    const handle = createStacklineAIHttpHandler({
      server: server(),
      cors: {
        origins: ["https://app.example.com"],
        credentials: true,
      },
    });
    const response = await handle(
      new Request("http://localhost/api/ai/chat", {
        method: "OPTIONS",
        headers: { origin: "https://app.example.com" },
      }),
    );

    expect(response.status).toBe(204);
    expect(response.headers.get("access-control-allow-origin")).toBe("https://app.example.com");
    expect(response.headers.get("access-control-allow-credentials")).toBe("true");
  });

  it("rejects invalid chat payloads", async () => {
    const handle = createStacklineAIHttpHandler({ server: server() });
    const response = await handle(
      new Request("http://localhost/api/ai/chat", {
        method: "POST",
        body: JSON.stringify({ messages: "hello" }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: { message: "messages must be an array." },
    });
  });

  it("rejects request bodies over the configured limit", async () => {
    const handle = createStacklineAIHttpHandler({ server: server(), maxBodyBytes: 10 });
    const response = await handle(
      new Request("http://localhost/api/ai/chat", {
        method: "POST",
        body: JSON.stringify({
          messages: [{ role: "user", content: "this body is too large" }],
        }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: { message: "Request body is larger than 10 bytes." },
    });
  });
});
