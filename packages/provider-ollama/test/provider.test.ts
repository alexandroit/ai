import { describe, expect, it } from "vitest";
import { ollamaProvider } from "../src";

describe("ollamaProvider", () => {
  it("lists models through Ollama tags", async () => {
    const provider = ollamaProvider({
      fetch: async () => Response.json({ models: [{ name: "llama3.1:latest" }] }),
    });

    await expect(provider.listModels?.()).resolves.toEqual([
      {
        id: "llama3.1:latest",
        name: "llama3.1:latest",
        provider: "ollama",
        metadata: { name: "llama3.1:latest" },
      },
    ]);
  });

  it("sends normalized chat messages to Ollama", async () => {
    const calls: Array<{ url: string; init: RequestInit }> = [];
    const provider = ollamaProvider({
      model: "llama3.1",
      fetch: async (input, init = {}) => {
        calls.push({ url: String(input), init });
        return Response.json({
          model: "llama3.1",
          message: { role: "assistant", content: "hello" },
        });
      },
    });

    await expect(
      provider.chat({ messages: [{ role: "user", content: "hi" }] }),
    ).resolves.toMatchObject({
      role: "assistant",
      content: "hello",
      model: "llama3.1",
    });

    expect(calls[0]?.url).toBe("http://127.0.0.1:11434/api/chat");
    expect(JSON.parse(String(calls[0]?.init.body))).toMatchObject({
      model: "llama3.1",
      messages: [{ role: "user", content: "hi" }],
      stream: false,
    });
  });

  it("resolves auto model from the local Ollama model list", async () => {
    const calls: Array<{ url: string; init: RequestInit }> = [];
    const provider = ollamaProvider({
      model: "auto",
      fetch: async (input, init = {}) => {
        calls.push({ url: String(input), init });
        if (String(input).endsWith("/api/tags")) {
          return Response.json({
            models: [{ name: "x/z-image-turbo:latest" }, { name: "gpt-oss:20b-cloud" }],
          });
        }
        return Response.json({
          model: "gpt-oss:20b",
          message: { role: "assistant", content: "ok" },
        });
      },
    });

    await expect(
      provider.chat({ messages: [{ role: "user", content: "hi" }] }),
    ).resolves.toMatchObject({
      role: "assistant",
      content: "ok",
      model: "gpt-oss:20b",
    });

    expect(calls.map((call) => call.url)).toEqual([
      "http://127.0.0.1:11434/api/tags",
      "http://127.0.0.1:11434/api/chat",
    ]);
    expect(JSON.parse(String(calls[1]?.init.body))).toMatchObject({
      model: "gpt-oss:20b-cloud",
    });
  });
});
