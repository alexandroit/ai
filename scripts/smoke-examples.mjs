import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const examples = [
  "local-demo",
  "ollama-minimal",
  "full-stack-vite",
  "express-adapter",
  "sqlite-memory",
  "postgres-rag",
  "complete-stack",
];

for (const example of examples) {
  const packagePath = join(root, "examples", example, "package.json");
  if (!existsSync(packagePath)) {
    throw new Error(`examples/${example}/package.json is missing.`);
  }
  const manifest = JSON.parse(readFileSync(packagePath, "utf8"));
  if (manifest.scripts?.smoke) {
    execFileSync("pnpm", ["--filter", manifest.name, "smoke"], {
      cwd: root,
      stdio: "inherit",
    });
  }
}

console.log("Stackline AI example smoke checks passed.");
