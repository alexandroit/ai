# ai-rag-postgres

> Unscoped convenience entry point for the Stackline AI PostgreSQL RAG retriever.

[![npm version](https://img.shields.io/npm/v/ai-rag-postgres.svg?style=flat-square)](https://www.npmjs.com/package/ai-rag-postgres)
[![license](https://img.shields.io/npm/l/ai-rag-postgres.svg?style=flat-square)](https://github.com/alexandroit/ai/blob/main/packages/alias-rag-postgres/LICENSE)
[![GitHub repository](https://img.shields.io/badge/GitHub-Repository-181717?style=flat-square&logo=github)](https://github.com/alexandroit/ai)

**[Documentation](https://alexandro.net/docs/ai/)** | **[npm](https://www.npmjs.com/package/ai-rag-postgres)** | **[Issues](https://github.com/alexandroit/ai/issues)** | **[Repository](https://github.com/alexandroit/ai)**

**Package version:** `0.0.2`

## Why this package?

Unscoped convenience entry point for `@stackline/ai-rag-postgres`. It re-exports the canonical package's runtime and TypeScript API without adding behavior. The source now lives alongside the scoped package so their dependency versions and GitHub Actions publication can be checked together.

## Compatibility

| Item | Value |
| --- | --- |
| Package | `ai-rag-postgres@0.0.2` |
| Supported Node.js | `>=18.17.0` |
| Module entry | `index.js` (ES modules) |
| Types | `index.d.ts` |
| Canonical dependency | `@stackline/ai-rag-postgres@0.0.5` |

The canonical adapter's backend requirements, options, and limitations also apply to this entry point.

## Installation

```bash
npm install ai-rag-postgres
```

## Usage

```js
import { createPostgresRagRetriever } from "ai-rag-postgres";
```

Use the same arguments and return values as the [canonical adapter](https://github.com/alexandroit/ai/tree/main/packages/rag-postgres).

## Security

This entry point shares its implementation and security boundaries with `@stackline/ai-rag-postgres`. Keep provider credentials, database access, and memory paths on the backend. Follow the [security policy](https://github.com/alexandroit/ai/blob/main/packages/alias-rag-postgres/SECURITY.md) when reporting vulnerabilities.

## API Surface

Every named runtime export and TypeScript declaration is re-exported from `@stackline/ai-rag-postgres`. The [canonical README](https://github.com/alexandroit/ai/tree/main/packages/rag-postgres) contains the complete examples, configuration, error behavior, and limitations.

## Local Development

Clone the [monorepo](https://github.com/alexandroit/ai) and run from its root with the Node and pnpm versions declared there:

```bash
pnpm install --frozen-lockfile
pnpm run check
```

## Consumer Smoke Test

```bash
pnpm run pack:release
node scripts/consumer-smoke.mjs release-artifacts
```

The consumer installs the scoped packages and aliases together, verifies that alias runtime exports have the same identities, and compiles the alias TypeScript imports.

## Release Checklist

1. Keep the alias re-exports and scoped dependency aligned with the corresponding workspace package.
2. Run the workspace checks, full and production dependency audits, and consumer smoke test.
3. Publish through [publish.yml](https://github.com/alexandroit/ai/actions/workflows/publish.yml), verifying the `expected_manifest_sha512` input against the reviewed archive manifest.
4. Publish scoped dependencies before aliases and verify public npm bytes and provenance.

## Community and Support

Report reproducible package issues in the [issue tracker](https://github.com/alexandroit/ai/issues).

- [Stackline / Alexandro.Net](https://alexandro.net/)
- [GitHub](https://github.com/alexandroit)
- [Maintainer LinkedIn](https://www.linkedin.com/in/aleinfo/)
- [Reddit community: r/Stackline](https://www.reddit.com/r/Stackline/)

## License

[MIT](https://github.com/alexandroit/ai/blob/main/packages/alias-rag-postgres/LICENSE). Copyright notices are retained from the canonical Stackline package.
