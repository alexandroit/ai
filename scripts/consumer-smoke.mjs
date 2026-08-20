import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const artifactDir = resolve(process.argv[2] || "release-artifacts");
const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const typescriptVersion = process.env.STACKLINE_TYPESCRIPT_VERSION;
const packages = {
  "@stackline/ai": "stackline-ai-0.0.3.tgz",
  "@stackline/ai-server": "stackline-ai-server-0.0.3.tgz",
  "@stackline/ai-ollama": "stackline-ai-ollama-0.0.3.tgz",
  "@stackline/ai-memory-sqlite": "stackline-ai-memory-sqlite-0.0.3.tgz",
  "@stackline/ai-rag-postgres": "stackline-ai-rag-postgres-0.0.3.tgz",
  "@stackline/ai-ui": "stackline-ai-ui-0.0.5.tgz",
};
const temporaryRoot = mkdtempSync(`${tmpdir()}/stackline-ai-consumer-`);

try {
  writeFileSync(
    resolve(temporaryRoot, "package.json"),
    `${JSON.stringify(
      {
        name: "stackline-ai-release-consumer",
        private: true,
        type: "module",
        dependencies: Object.fromEntries(
          Object.entries(packages).map(([name, archive]) => [name, `file:${resolve(artifactDir, archive)}`]),
        ),
        ...(typescriptVersion ? { devDependencies: { typescript: typescriptVersion } } : {}),
      },
      null,
      2,
    )}\n`,
  );

  writeFileSync(
    resolve(temporaryRoot, "runtime.mjs"),
    `import { createStacklineAIServer } from "@stackline/ai/server";
import { createStacklineAIHttpHandler } from "@stackline/ai-server";
import { ollamaProvider } from "@stackline/ai-ollama";
import { createSqliteMemoryStore } from "@stackline/ai-memory-sqlite";
import { createPostgresRagRetriever } from "@stackline/ai-rag-postgres";
import { stacklineAIStudioTagName } from "@stackline/ai-ui";

const provider = {
  name: "consumer",
  capabilities: () => ({ streaming: false, tools: false, vision: false, embeddings: false, modelListing: true, jsonMode: false, structuredOutput: false }),
  listModels: async () => [{ id: "consumer-model" }],
  chat: async (request) => ({ role: "assistant", content: request.messages.at(-1)?.content || "", model: request.model }),
};
const ai = createStacklineAIServer({ provider });
const handler = createStacklineAIHttpHandler({ server: ai });
const health = await handler(new Request("http://localhost/api/ai/health"));
if (health.status !== 200) throw new Error("Invalid HTTP handler runtime.");

const ollama = ollamaProvider({
  model: "consumer-model",
  fetch: async (input) => String(input).endsWith("/api/tags")
    ? Response.json({ models: [{ name: "consumer-model" }] })
    : Response.json({ model: "consumer-model", message: { role: "assistant", content: "ok" } }),
});
if ((await ollama.listModels?.())?.[0]?.id !== "consumer-model") throw new Error("Invalid Ollama adapter runtime.");

const memoryPath = new URL("./memory.sqlite", import.meta.url).pathname;
const memory = createSqliteMemoryStore({ path: memoryPath });
await memory.saveInteraction({ request: { messages: [{ role: "user", content: "hello" }] }, response: { role: "assistant", content: "world" } });
if (!(await memory.search?.("world"))?.length) throw new Error("Invalid SQLite memory runtime.");
memory.close();

const rag = createPostgresRagRetriever({
  client: { query: async () => ({ rows: [{ content: "context" }] }) },
  sql: "select content from context where content ilike $1 limit $2",
});
if ((await rag.retrieve({ messages: [{ role: "user", content: "hello" }] }))[0]?.content !== "context") {
  throw new Error("Invalid PostgreSQL RAG runtime.");
}
if (stacklineAIStudioTagName !== "stackline-ai-studio") throw new Error("Invalid UI runtime export.");
console.log("Stackline AI release consumer passed.");
`,
  );

  writeFileSync(
    resolve(temporaryRoot, "types.ts"),
    `import { createStacklineAIServer, type StacklineAIProvider } from "@stackline/ai/server";
import { createStacklineAIHttpHandler, type StacklineAIHttpHandlerOptions } from "@stackline/ai-server";
import { ollamaProvider, type OllamaProviderOptions } from "@stackline/ai-ollama";
import { createSqliteMemoryStore, type StacklineSqliteMemoryStoreOptions } from "@stackline/ai-memory-sqlite";
import { createPostgresRagRetriever, type StacklinePostgresRagRetrieverOptions } from "@stackline/ai-rag-postgres";
import { defineStacklineAIStudio, type StacklineAIStudioElement } from "@stackline/ai-ui";

declare const provider: StacklineAIProvider;
const server = createStacklineAIServer({ provider });
const httpOptions: StacklineAIHttpHandlerOptions = { server };
createStacklineAIHttpHandler(httpOptions);
const ollamaOptions: OllamaProviderOptions = { model: "consumer-model" };
ollamaProvider(ollamaOptions);
const sqliteOptions: StacklineSqliteMemoryStoreOptions = { path: "memory.sqlite" };
createSqliteMemoryStore(sqliteOptions).close();
const postgresOptions: StacklinePostgresRagRetrieverOptions = {
  client: { query: async () => ({ rows: [] }) },
};
createPostgresRagRetriever(postgresOptions);
defineStacklineAIStudio();
declare const studio: StacklineAIStudioElement;
studio.send("hello");
`,
  );
  writeFileSync(
    resolve(temporaryRoot, "tsconfig.json"),
    `${JSON.stringify(
      {
        compilerOptions: {
          lib: ["ES2022", "DOM"],
          module: "NodeNext",
          moduleResolution: "NodeNext",
          noEmit: true,
          skipLibCheck: false,
          strict: true,
          target: "ES2022",
        },
        files: ["types.ts"],
      },
      null,
      2,
    )}\n`,
  );

  const npm = process.platform === "win32" ? "npm.cmd" : "npm";
  execFileSync(npm, ["install", "--ignore-scripts", "--no-audit", "--no-fund"], {
    cwd: temporaryRoot,
    stdio: "inherit",
  });
  execFileSync(process.execPath, ["runtime.mjs"], { cwd: temporaryRoot, stdio: "inherit" });
  const typescriptBin = typescriptVersion
    ? resolve(temporaryRoot, "node_modules/typescript/bin/tsc")
    : resolve(repositoryRoot, "node_modules/typescript/bin/tsc");
  if (existsSync(typescriptBin)) {
    execFileSync(process.execPath, [typescriptBin, "--project", "tsconfig.json"], {
      cwd: temporaryRoot,
      stdio: "inherit",
    });
  } else if (typescriptVersion) {
    throw new Error(`TypeScript ${typescriptVersion} was not installed for the consumer smoke test.`);
  }
  execFileSync(npm, ["audit", "--omit=dev", "--audit-level=low"], {
    cwd: temporaryRoot,
    stdio: "inherit",
  });
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
}
