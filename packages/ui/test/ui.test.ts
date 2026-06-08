import { describe, expect, it } from "vitest";
import {
  assistantDisplayMarkdown,
  defineStacklineAIStudio,
  normalizeStoredStudioState,
  resolveStacklineAIStudioModelId,
  resolveStacklineAIStudioTranslations,
  renderStacklineMarkdown,
  sanitizeStudioMessageForStorage,
  stacklineAIStorageByteLength,
  stacklineAIStudioTagName,
} from "../src";

describe("Stackline AI UI", () => {
  it("does not require a browser during server-side import", () => {
    expect(stacklineAIStudioTagName).toBe("stackline-ai-studio");
    expect(typeof defineStacklineAIStudio).toBe("function");
  });

  it("renders assistant markdown into formatted safe html", () => {
    const html = renderStacklineMarkdown(
      [
        "## Resultado",
        "",
        "Texto com **negrito** e `codigo`.",
        "",
        "- Brasil",
        "- Canada",
        "",
        "| Artista | Musica |",
        "| --- | --- |",
        "| Yasmin Santos | Evidencias |",
      ].join("\n"),
    );

    expect(html).toContain("<h4>Resultado</h4>");
    expect(html).toContain("<strong>negrito</strong>");
    expect(html).toContain("<code>codigo</code>");
    expect(html).toContain("<ul><li>Brasil</li><li>Canada</li></ul>");
    expect(html).toContain("<table>");
    expect(html).toContain("<td>Yasmin Santos</td>");
  });

  it("renders safe html content while keeping code blocks escaped", () => {
    const html = renderStacklineMarkdown(
      [
        '<p>Primeira linha<br>Segunda linha com <strong>força</strong>.</p>',
        '<script>alert("x")</script>',
        '<a href="javascript:alert(1)">bad</a>',
        '[good](https://alexandro.net)',
        "",
        "```html",
        "<p>codigo deve aparecer</p>",
        "```",
      ].join("\n"),
    );

    expect(html).toContain("<p>Primeira linha<br>Segunda linha com <strong>força</strong>.</p>");
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("alert");
    expect(html).not.toContain("javascript:");
    expect(html).toContain('href="https://alexandro.net"');
    expect(html).toContain("&lt;p&gt;codigo deve aparecer&lt;/p&gt;");
  });

  it("normalizes persisted localStorage state", () => {
    const state = normalizeStoredStudioState(
      {
        version: 1,
        selectedModelId: "auto",
        selectedLanguage: "pt-BR",
        updatedAt: "2026-06-07T00:00:00.000Z",
        messages: [
          { role: "user", content: "first" },
          { role: "invalid", content: "bad" },
          { role: "assistant", content: "second", metadata: { stacklineRag: { enabled: true } } },
        ],
      },
      1,
    );

    expect(state).toMatchObject({
      version: 1,
      selectedModelId: "auto",
      selectedLanguage: "pt",
      messages: [{ role: "assistant", content: "second" }],
    });
    expect(state?.messages[0]?.metadata).toBeUndefined();
  });

  it("resolves built-in and custom Studio translations", () => {
    const portuguese = resolveStacklineAIStudioTranslations("pt-BR");
    const custom = resolveStacklineAIStudioTranslations("fr", { send: "Go" });

    expect(portuguese.send).toBe("Enviar");
    expect(portuguese.modelSelectText).toBe("Selecionar modelo");
    expect(custom.send).toBe("Go");
    expect(custom.clear).toBe("Effacer");
  });

  it("renders fallback markdown for persisted empty assistant messages with RAG sources", () => {
    const markdown = assistantDisplayMarkdown({
      role: "assistant",
      content: "",
      metadata: {
        stacklineRag: {
          enabled: true,
          contextCount: 2,
          sources: [
            {
              source: "local-catalog:song:2",
              metadata: { artistName: "Demo Rock Band", songName: "Demo Anthem" },
            },
            {
              source: "local-catalog:song:3",
              metadata: { artistName: "Demo Cover Artist", songName: "Demo Anthem" },
            },
          ],
        },
      },
    });

    expect(markdown).toContain("## RAG results");
    expect(markdown).toContain("| Demo Rock Band | Demo Anthem | local-catalog:song:2 |");
    expect(renderStacklineMarkdown(markdown)).toContain("<table>");
  });

  it("renders fallback RAG markdown using the requested language", () => {
    const markdown = assistantDisplayMarkdown(
      {
        role: "assistant",
        content: "",
        metadata: {
          stacklineRag: {
            enabled: true,
            contextCount: 1,
            sources: [
              {
                source: "local-catalog:song:2",
                metadata: { artistName: "Demo Rock Band", songName: "Demo Anthem" },
              },
            ],
          },
        },
      },
      resolveStacklineAIStudioTranslations("es"),
    );

    expect(markdown).toContain("## Resultados RAG");
    expect(markdown).toContain("fuente coincidente encontrada");
    expect(markdown).toContain("| # | Artista | Título | Fuente |");
  });

  it("selects the first available model when no valid model is selected", () => {
    const models = [
      { id: "gpt-oss:20b-cloud", name: "gpt-oss:20b-cloud" },
      { id: "x/z-image-turbo:latest", name: "x/z-image-turbo:latest" },
    ];

    expect(resolveStacklineAIStudioModelId(models)).toBe("gpt-oss:20b-cloud");
    expect(resolveStacklineAIStudioModelId(models, "", "auto")).toBe("gpt-oss:20b-cloud");
    expect(resolveStacklineAIStudioModelId(models, "x/z-image-turbo:latest", "auto")).toBe(
      "x/z-image-turbo:latest",
    );
  });

  it("trims persisted history by byte budget while keeping the newest messages", () => {
    const state = normalizeStoredStudioState(
      {
        version: 1,
        selectedModelId: "gpt-oss:20b-cloud",
        updatedAt: "2026-06-07T00:00:00.000Z",
        messages: [
          { role: "user", content: "old-" + "a".repeat(180) },
          { role: "assistant", content: "middle-" + "b".repeat(180) },
          { role: "user", content: "new question" },
          { role: "assistant", content: "new answer" },
        ],
      },
      50,
      260,
    );

    expect(state).not.toBeNull();
    expect(state?.messages.at(-2)?.content).toBe("new question");
    expect(state?.messages.at(-1)?.content).toBe("new answer");
    expect(state?.messages.some((message) => message.content.startsWith("old-"))).toBe(false);
    expect(stacklineAIStorageByteLength(state)).toBeLessThanOrEqual(260);
  });

  it("does not persist RAG evidence metadata in browser storage", () => {
    const message = sanitizeStudioMessageForStorage({
      role: "assistant",
      content: "Answer visible to the user.",
      metadata: {
        stacklineRag: {
          enabled: true,
          sources: [{ source: "local-catalog:song:4", excerpt: "large context" }],
        },
        stacklineRagFallback: true,
        safeTraceId: "trace-1",
      },
    });

    expect(message).toEqual({
      role: "assistant",
      content: "Answer visible to the user.",
      metadata: { safeTraceId: "trace-1" },
    });
  });
});
