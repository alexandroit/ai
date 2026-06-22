# Troubleshooting

| Symptom | Cause | How to verify | Fix |
| ------- | ----- | ------------- | --- |
| `Cannot use import statement outside a module` | App is not ESM | Check `package.json` | Add `"type": "module"` |
| Package subpath not exported | Import path is not in `exports` | Inspect package `exports` | Use documented imports such as `@stackline/ai` or `@stackline/ai/server` |
| Named export not found | Import does not exist | Check `dist/index.d.ts` | Use real exports from the package reference |
| Node has no `fetch` | Runtime too old | `node -p "typeof fetch"` | Use modern Node or provide a fetch implementation to provider options |
| pnpm fails with `node:sqlite` | pnpm 11 needs newer Node | `node --version` | Use Node `>=22.13.0` for repo development |
| Ollama not installed | CLI missing | `ollama --version` | Install Ollama |
| Ollama not started | Port closed | `curl http://127.0.0.1:11434/api/tags` | Start Ollama |
| Connection refused on 11434 | Ollama target wrong or stopped | Check `OLLAMA_TARGET` | Use `http://127.0.0.1:11434` or your real target |
| No models installed | `/api/tags` returns empty | `ollama list` | `ollama pull <model>` |
| Model not found | Requested model not installed | `ollama list` | Use an installed model or `model: "auto"` |
| `Ollama chat requires a model. Use a model name or model: "auto".` | Empty model and auto could not resolve a model | `curl /api/tags` | Install a model or configure `OLLAMA_MODEL` |
| `/models` format incompatible | Backend is not returning `{ models: [] }` | `curl /api/ai/models` | Use `createStacklineAIHttpHandler` or match its schema |
| `/chat` format incompatible | Backend is not returning `content` or `message.content` | `curl /api/ai/chat` | Return the documented schema |
| CORS error | Origin not allowed | Browser console and response headers | Configure `cors.origins` |
| `404` on base path | Wrong `basePath` or proxy | `curl /api/ai/health` | Align `basePath`, Vite proxy, and UI endpoints |
| Body already consumed by Express | `express.json()` ran first | Remove body parser from route | Adapt raw Express request to Web `Request` |
| Vite proxy incorrect | UI calls a path not proxied | Network tab | Proxy `/api/ai` to backend port |
| UI not registered | `@stackline/ai-ui` not imported | `customElements.get("stackline-ai-studio")` | `import "@stackline/ai-ui"` |
| Custom element unknown | Import not loaded before render | Browser console | Import the package in the app entry |
| SQLite permission error | Data folder not writable | Check filesystem permissions | Create writable `data/` folder |
| SQLite data missing after restart | Memory disabled or wrong path | Check `STACKLINE_AI_MEMORY` and path | Enable memory and use a stable path |
| PostgreSQL unavailable | Database offline or URL wrong | `psql "$RAG_DATABASE_URL"` | Start DB and fix URL |
| Table or view missing | Schema not applied | `\d stackline_ai_rag_view` | Run `sql/schema.sql` |
| Placeholder SQL wrong | Query does not match values | Log query text and values | Use `$1` for query and `$2` for limit |
| RAG empty | Query too short or no rows | Check `RAG_MIN_QUERY_LENGTH` and SQL | Seed data or lower minimum |
| Memory mixes users | Missing `metadata.userId` / `sessionId` | Inspect request metadata | Send both identifiers from backend policy |
| Port in use | Another process owns the port | `lsof -i :8787` | Change `PORT` or stop the process |
| Shutdown incomplete | Resources not closed | Look for open handles | Call `close()` on memory/RAG resources |
| npm package missing `dist` | Build not run before pack | `npm pack --dry-run` | Run build before publishing |
| Types missing | `dist/index.d.ts` missing | Inspect tarball | Run package build |

