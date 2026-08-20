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

  it("requires an explicit model when an allowlist is configured", async () => {
    const handle = createStacklineAIHttpHandler({ server: server(), allowedModels: ["demo"] });
    const response = await handle(
      new Request("http://localhost/api/ai/chat", {
        method: "POST",
        body: JSON.stringify({ messages: [{ role: "user", content: "hello" }] }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: { message: "model is required when allowedModels is configured." },
    });
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

  it("does not answer preflight requests outside the configured base path", async () => {
    const handle = createStacklineAIHttpHandler({ server: server(), cors: { origins: "*" } });
    const response = await handle(
      new Request("http://localhost/not-stackline/chat", { method: "OPTIONS" }),
    );

    expect(response.status).toBe(404);
  });

  it("rejects wildcard CORS credentials and invalid body limits", () => {
    expect(() =>
      createStacklineAIHttpHandler({
        server: server(),
        cors: { origins: "*", credentials: true },
      }),
    ).toThrow('cors.credentials cannot be used with cors.origins set to "*".');
    expect(() => createStacklineAIHttpHandler({ server: server(), maxBodyBytes: -1 })).toThrow(
      "maxBodyBytes must be a non-negative safe integer.",
    );
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

    expect(response.status).toBe(413);
    await expect(response.json()).resolves.toMatchObject({
      error: { message: "Request body is larger than 10 bytes." },
    });
  });

  it("rejects an oversized content-length before reading the request stream", async () => {
    let pulls = 0;
    const body = new ReadableStream<Uint8Array>({
      pull(controller) {
        pulls += 1;
        controller.enqueue(new TextEncoder().encode("ignored"));
        controller.close();
      },
    });
    const handle = createStacklineAIHttpHandler({ server: server(), maxBodyBytes: 10 });
    const request = new Request("http://localhost/api/ai/chat", {
      method: "POST",
      headers: { "content-length": "100" },
      body,
      duplex: "half",
    } as RequestInit & { duplex: "half" });
    await Promise.resolve();
    const pullsBeforeHandle = pulls;
    const response = await handle(request);

    expect(response.status).toBe(413);
    expect(pulls).toBe(pullsBeforeHandle);
    expect(request.bodyUsed).toBe(false);
    expect(request.body?.locked).toBe(false);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
  });
});
