# ai-ollama

> Unscoped convenience entry point for the Stackline AI Ollama provider.

[![npm version](https://img.shields.io/npm/v/ai-ollama.svg?style=flat-square)](https://www.npmjs.com/package/ai-ollama)
[![license](https://img.shields.io/npm/l/ai-ollama.svg?style=flat-square)](https://github.com/alexandroit/ai)
[![GitHub repository](https://img.shields.io/badge/GitHub-alexandroit%2Fai-181717?style=flat-square&logo=github)](https://github.com/alexandroit/ai)
[![Docs](https://img.shields.io/badge/docs-alexandro.net-0f766e?style=flat-square)](https://alexandro.net/docs/ai/)
[![Reddit community](https://img.shields.io/badge/community-r%2FStackline-ff4500?style=flat-square&logo=reddit&logoColor=white)](https://www.reddit.com/r/Stackline/)

**[Documentation](https://alexandro.net/docs/ai/)** | **[npm](https://www.npmjs.com/package/ai-ollama)** | **[Issues](https://github.com/alexandroit/ai/issues)** | **[Repository](https://github.com/alexandroit/ai)**

**Current package version:** `0.0.3`

---

## Why this package?

Unscoped convenience entry point for `@stackline/ai-ollama`. It re-exports the canonical package's runtime and TypeScript API without adding behavior. The source now lives alongside the scoped package so their dependency versions and GitHub Actions publication can be checked together.

## Compatibility

| Item | Value |
| --- | --- |
| Package | `ai-ollama@0.0.3` |
| Supported Node.js | `>=18.17.0` |
| Module entry | `index.js` (ES modules) |
| Types | `index.d.ts` |
| Canonical dependency | `@stackline/ai-ollama@0.0.4` |

The canonical adapter's backend requirements, options, and limitations also apply to this entry point.

## Installation

```bash
npm install ai-ollama
```

## Usage

```js
import { ollamaProvider } from "ai-ollama";
```

Use the same arguments and return values as the [canonical adapter](https://github.com/alexandroit/ai/tree/main/packages/provider-ollama).

## Security

This entry point shares its implementation and security boundaries with `@stackline/ai-ollama`. Keep provider credentials, database access, and memory paths on the backend. Follow the [security policy](https://github.com/alexandroit/ai/blob/main/packages/alias-ollama/SECURITY.md) when reporting vulnerabilities.

## API Surface

Every named runtime export and TypeScript declaration is re-exported from `@stackline/ai-ollama`. The [canonical README](https://github.com/alexandroit/ai/tree/main/packages/provider-ollama) contains the complete examples, configuration, error behavior, and limitations.

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

## License

[MIT](https://github.com/alexandroit/ai/blob/main/packages/alias-ollama/LICENSE). Copyright notices are retained from the canonical Stackline package.

## Credits and original authors

- Stackline.
- Copyright (c) 2026 Alexandro Marques.
- Stackline maintenance: [Alexandro Paixao Marques](https://www.linkedin.com/in/aleinfo/) and [Stackline contributors](https://github.com/alexandroit).

Original copyright, license notices and contributor acknowledgements remain part of this distribution. Stackline maintenance does not replace authorship of the original work.

## Community and Links

- [Stackline website](https://alexandro.net/)
- [GitHub projects](https://github.com/alexandroit)
- [npm packages](https://www.npmjs.com/~alex360qc)
- [Reddit community — r/Stackline](https://www.reddit.com/r/Stackline/)
- [Maintainer LinkedIn](https://www.linkedin.com/in/aleinfo/)

Use this repository's issue tracker for reproducible bugs and feature requests. Join r/Stackline for examples, usage questions and release discussions.
