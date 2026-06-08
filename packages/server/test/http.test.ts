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
});
