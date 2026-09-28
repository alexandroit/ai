import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Dependency order: core, scoped integrations, then their compatibility aliases.
export const packageDirectories = [
  "packages/ai",
  "packages/server",
  "packages/provider-ollama",
  "packages/memory-sqlite",
  "packages/rag-postgres",
  "packages/ui",
  "packages/alias-memory-sqlite",
  "packages/alias-ollama",
  "packages/alias-rag-postgres",
];

export function releasePackages(root) {
  return packageDirectories.map((directory) => ({
    directory,
    manifest: JSON.parse(readFileSync(resolve(root, directory, "package.json"), "utf8")),
  }));
}

export function archiveName(manifest) {
  return `${manifest.name.replace(/^@/, "").replaceAll("/", "-")}-${manifest.version}.tgz`;
}
