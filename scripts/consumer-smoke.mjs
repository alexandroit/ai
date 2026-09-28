import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { archiveName, releasePackages } from "./release-packages.mjs";

const artifactDir = resolve(process.argv[2] || "release-artifacts");
const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const typescriptVersion = process.env.STACKLINE_TYPESCRIPT_VERSION;
const packages = Object.fromEntries(
  releasePackages(repositoryRoot).map(({ manifest }) => [manifest.name, archiveName(manifest)]),
);
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
    `import * as scopedMemory from "@stackline/ai-memory-sqlite";
import * as memoryAlias from "ai-memory-sqlite";
import * as scopedOllama from "@stackline/ai-ollama";
import * as ollamaAlias from "ai-ollama";
import * as scopedRag from "@stackline/ai-rag-postgres";
import * as ragAlias from "ai-rag-postgres";
import { createStacklineAIServer } from "@stackline/ai/server";
import { createStacklineAIHttpHandler } from "@stackline/ai-server";
import { ollamaProvider } from "@stackline/ai-ollama";
import { createSqliteMemoryStore } from "@stackline/ai-memory-sqlite";
import { createPostgresRagRetriever } from "@stackline/ai-rag-postgres";
import { stacklineAIStudioTagName } from "@stackline/ai-ui";

for (const [canonical, alias] of [[scopedMemory, memoryAlias], [scopedOllama, ollamaAlias], [scopedRag, ragAlias]]) {
  const names = Object.keys(canonical).sort();
  if (JSON.stringify(names) !== JSON.stringify(Object.keys(alias).sort())) throw new Error("Alias export names differ.");
  for (const name of names) if (canonical[name] !== alias[name]) throw new Error("Alias export identity differs: " + name);
}

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
import { createSqliteMemoryStore as aliasMemory, type StacklineSqliteMemoryStoreOptions as AliasSqliteOptions } from "ai-memory-sqlite";
import { ollamaProvider as aliasOllama, type OllamaProviderOptions as AliasOllamaOptions } from "ai-ollama";
import { createPostgresRagRetriever as aliasRag, type StacklinePostgresRagRetrieverOptions as AliasPostgresOptions } from "ai-rag-postgres";

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
const aliasSqliteOptions: AliasSqliteOptions = sqliteOptions;
const aliasOllamaOptions: AliasOllamaOptions = ollamaOptions;
const aliasPostgresOptions: AliasPostgresOptions = postgresOptions;
aliasMemory(aliasSqliteOptions).close();
aliasOllama(aliasOllamaOptions);
aliasRag(aliasPostgresOptions);
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
  const install = spawnSync(npm, ["install", "--ignore-scripts", "--no-audit", "--no-fund"], {
    cwd: temporaryRoot,
    encoding: "utf8",
  });
  process.stdout.write(install.stdout || "");
  process.stderr.write(install.stderr || "");
  if (install.status !== 0) throw new Error(`Consumer npm install failed with status ${install.status}.`);
  if (/(?:^|\n)npm\s+(?:warn|error)\b|deprecated/i.test(`${install.stdout || ""}\n${install.stderr || ""}`)) {
    throw new Error("Consumer npm install emitted a warning, error, or deprecation notice.");
  }
  execFileSync(npm, ["ls", "--all"], { cwd: temporaryRoot, stdio: "inherit" });
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
  execFileSync(npm, ["audit", "--audit-level=low"], {
    cwd: temporaryRoot,
    stdio: "inherit",
  });
  const dependencyTree = execFileSync(npm, ["ls", "--all", "--json"], {
    cwd: temporaryRoot,
    encoding: "utf8",
  });
  if (/\"(?:xtend|postgres-array|postgres-bytea|postgres-date|postgres-interval)\"\s*:/.test(dependencyTree)) {
    throw new Error("A removed legacy PostgreSQL dependency re-entered the consumer closure.");
  }
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
}
