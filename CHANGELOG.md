# Changelog

All notable changes to the Stackline AI package family are documented here.

## 2026-09-28

- Updates only the Express example's qs lock resolution from 6.15.2 to 6.16.0, fixing GHSA-x5fp-wj9c-mxmx and GHSA-4mjr-xmp4-gh2g; qs is not shipped in the library packages.

- Publishes the existing server/provider/UI security hardening in the next scoped patches.
- Adds the three existing unscoped adapter entry points to the same source-controlled release pipeline.
- Standardizes package discovery metadata, documentation, compatibility tables, and community links.
- Pins release packaging to official Node.js 24.20.0, npm 11.19.0, and pnpm 11.22.0; registry checks fail closed unless the requested version returns E404.

- Replaces path-normalization regular expressions with linear scanners in the
  HTTP server and Ollama provider.
- Reworks safe HTML rendering as a single-pass allowlist parser that suppresses
  dangerous nested blocks and escapes malformed markup.
- Adds regression coverage for long slash runs and malformed nested HTML.

## 2026-08-20

### @stackline/ai 0.0.3

- Preserved the provider, RAG, memory, and server contracts from `0.0.2`.
- Made emitted ESM declarations compatible with Node16 and NodeNext module resolution.
- Added reproducible release validation and complete package documentation files.

### @stackline/ai-server 0.0.3

- Enforced request limits while streaming the body and return HTTP `413` for oversized payloads.
- Required an explicit model whenever `allowedModels` is configured.
- Rejected invalid wildcard CORS credential configurations and out-of-scope preflight routes.
- Added `Cache-Control: no-store` and `X-Content-Type-Options: nosniff` to JSON responses.

### @stackline/ai-ollama 0.0.3

- Preserved the `0.0.2` provider API and aligned the package with the `0.0.3` core release.

### @stackline/ai-memory-sqlite 0.0.3

- Updated `sql.js` within its compatible `1.x` line.

### @stackline/ai-rag-postgres 0.0.3

- Updated `pg` and its TypeScript declarations within the compatible `8.x` line.
- Published `@types/pg` as a runtime dependency because it is referenced by the public declarations.

### @stackline/ai-ui 0.0.5

- Updated the model picker to `@stackline/multiselect@1.1.3`.
- Preserved the custom-element API, language packs, storage format, and rendering behavior from `0.0.4`.

### Tooling

- Updated pnpm, Vitest, Vite, and safe transitive build dependencies.
- Added pinned GitHub Actions, package artifact checks, installed-consumer tests
  across Node 18 through 24 and TypeScript 5.9 through 6.0, and zero-vulnerability
  audits.
