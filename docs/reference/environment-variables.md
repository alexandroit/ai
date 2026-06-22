# Environment Variables

| Variable | Purpose | Default |
|---|---|---|
| `PORT` | Backend HTTP port | `8787` |
| `WEB_ORIGIN` | Allowed browser origin | `http://localhost:4623` |
| `STACKLINE_AI_BASE_PATH` | HTTP base path | `/api/ai` |
| `STACKLINE_AI_MAX_BODY_BYTES` | Request body limit | `262144` |
| `STACKLINE_AI_ALLOWED_MODELS` | Comma-separated model allow-list | empty |
| `OLLAMA_TARGET` | Ollama API target | `http://127.0.0.1:11434` |
| `OLLAMA_MODEL` | Explicit model or `auto` | `auto` |
| `STACKLINE_AI_MEMORY` | Enable SQLite memory | `false` |
| `STACKLINE_AI_MEMORY_PATH` | SQLite file path | `./data/memory.sqlite` |
| `STACKLINE_AI_RAG` | Enable PostgreSQL RAG | `false` |
| `RAG_DATABASE_URL` | PostgreSQL connection string | none |
| `RAG_MIN_QUERY_LENGTH` | Minimum query length | `2` |
| `RAG_LIMIT` | RAG result limit | `4` |

