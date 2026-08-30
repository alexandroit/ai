# Changelog

## 0.0.4 - 2026-08-30

- Preserves the complete `0.0.3` runtime and TypeScript API.
- Resolves `pg` through `@stackline/pg@1.0.0` and `@types/pg` through
  `@stackline/types-pg@1.0.0` using transparent npm aliases.
- Removes the archived `xtend` dependency chain from fresh consumer installs.
- Adds warning, dependency-tree, full-audit, runtime, and TypeScript consumer
  release gates.

## 0.0.3 - 2026-08-20

- Updates `pg` to `8.23.0` and `@types/pg` to `8.23.1`.
- Publishes `@types/pg` as a dependency because the public declarations reference its types.
- Preserves the query, mapping, and retriever contracts from `0.0.2`.
