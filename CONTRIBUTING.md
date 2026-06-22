# Contributing

Use Node `>=22.13.0` and pnpm `11.5.2`.

```bash
corepack enable
pnpm install
pnpm run check
```

Keep package APIs documented from source and declaration files. Do not add
README examples that are not covered by tests or executable examples.

Before opening a pull request, run:

```bash
pnpm run lint
pnpm run typecheck
pnpm test
pnpm run build
pnpm run examples:smoke
pnpm run pack:dry-run
```

