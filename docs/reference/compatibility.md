# Compatibility

## Repository Development

- Node.js `>=22.13.0`
- pnpm `11.22.0`

## Published Package Runtime

- Node.js `>=18.17.0`
- ESM
- Fetch API primitives for backend packages

## TypeScript Consumers

Packed declarations are tested with TypeScript `5.9.3` and `6.0.3`, including
NodeNext module resolution.

## Browser UI

`@stackline/ai-ui` requires:

- Custom Elements
- Shadow DOM
- `fetch`
- `localStorage` for persistence unless disabled

## Vite Examples

Vite 8.2.1 requires Node `^20.19.0 || >=22.12.0`.
