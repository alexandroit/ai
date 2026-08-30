# Dependency Review

Reviewed on 2026-08-30 for `@stackline/ai-rag-postgres@0.0.4`.

## Runtime closure

- `@stackline/ai` is the workspace core and is pinned by pnpm when packed.
- `pg` resolves to `@stackline/pg@1.0.0` through an npm alias.
- `@types/pg` resolves to `@stackline/types-pg@1.0.0` through an npm alias.
- The compatibility forks preserve the public PostgreSQL APIs while replacing
  the archived `pg-types -> postgres-interval -> xtend` branch.

The accepted release must pass a fresh npm consumer install with no warnings,
`npm ls --all`, full `npm audit`, runtime tests, TypeScript tests, and an explicit
check that the removed legacy packages are absent from the closure.
