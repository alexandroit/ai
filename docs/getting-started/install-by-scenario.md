# Install By Scenario

Use this page to choose the exact `npm install` command for the app you are
building. The browser UI only works after a backend exists.

## Scenario 1: Core Only

Use this when you are writing a custom provider or testing the Stackline AI
contracts without HTTP, UI, Ollama, memory, or RAG.

```bash
npm init -y
npm pkg set type=module
npm install @stackline/ai
```

You provide your own provider object:

```js
import { createStacklineAIServer } from "@stackline/ai";
```

## Scenario 2: Ollama Provider Only

Use this when you want backend code to call Ollama directly, but you do not
need HTTP routes or the browser UI yet.

```bash
npm init -y
npm pkg set type=module
npm install @stackline/ai @stackline/ai-ollama
```

Verify Ollama first:

```bash
ollama list
curl http://127.0.0.1:11434/api/tags
```

Then use:

```js
import { createStacklineAIServer } from "@stackline/ai/server";
import { ollamaProvider } from "@stackline/ai-ollama";
```

## Scenario 3: Backend API With Ollama

Use this when you want `/api/ai/models` and `/api/ai/chat`, but no browser UI
yet.

```bash
npm init -y
npm pkg set type=module
npm install @stackline/ai @stackline/ai-server @stackline/ai-ollama
```

Create `.env`:

```bash
PORT=8787
WEB_ORIGIN=http://localhost:4623
OLLAMA_TARGET=http://127.0.0.1:11434
OLLAMA_MODEL=llama3.1
```

Test before adding UI:

```bash
curl http://127.0.0.1:8787/api/ai/models
curl http://127.0.0.1:8787/api/ai/chat \
  -H 'content-type: application/json' \
  -d '{"model":"llama3.1","messages":[{"role":"user","content":"Hello"}]}'
```

## Scenario 4: Full Browser UI With Ollama

Use this when you want `<stackline-ai-studio>` to work in a Vite app. This is
the normal install for frontend users because the UI needs the backend packages
too.

```bash
npm init -y
npm pkg set type=module
npm install @stackline/ai @stackline/ai-server @stackline/ai-ollama @stackline/ai-ui
npm install -D vite
```

The UI then calls:

```text
GET /api/ai/models
POST /api/ai/chat
```

Render only after the backend works:

```js
import "@stackline/ai-ui";
```

```html
<stackline-ai-studio
  endpoint="/api/ai/chat"
  models-endpoint="/api/ai/models"
  model="llama3.1"
></stackline-ai-studio>
```

## Scenario 5: Full UI With SQLite Memory

Use this when you want the UI, backend, Ollama, and persisted local
conversation memory.

```bash
npm init -y
npm pkg set type=module
npm install @stackline/ai @stackline/ai-server @stackline/ai-ollama @stackline/ai-ui @stackline/ai-memory-sqlite
npm install -D vite
```

Create a writable data folder:

```bash
mkdir -p data
```

Add to `.env`:

```bash
STACKLINE_AI_MEMORY=true
STACKLINE_AI_MEMORY_PATH=./data/memory.sqlite
```

Use SQLite for local development, demos, and single-instance private tools.

## Scenario 6: Full UI With PostgreSQL RAG

Use this when you want the UI, backend, Ollama, and database retrieval.

```bash
npm init -y
npm pkg set type=module
npm install @stackline/ai @stackline/ai-server @stackline/ai-ollama @stackline/ai-ui @stackline/ai-rag-postgres
npm install -D vite
```

Add to `.env`:

```bash
STACKLINE_AI_RAG=true
RAG_DATABASE_URL=postgres://readonly_user:password@127.0.0.1:5432/app
RAG_MIN_QUERY_LENGTH=2
RAG_LIMIT=4
```

Use a read-only database user and a stable view for retrieval.

## Scenario 7: Complete Stack

Use this when you want UI, backend, Ollama, SQLite memory, and PostgreSQL RAG.

```bash
npm init -y
npm pkg set type=module
npm install @stackline/ai @stackline/ai-server @stackline/ai-ollama @stackline/ai-ui @stackline/ai-memory-sqlite @stackline/ai-rag-postgres
npm install -D vite
mkdir -p data sql src
```

Recommended `.env`:

```bash
PORT=8787
WEB_ORIGIN=http://localhost:4623
STACKLINE_AI_BASE_PATH=/api/ai
STACKLINE_AI_MAX_BODY_BYTES=262144

OLLAMA_TARGET=http://127.0.0.1:11434
OLLAMA_MODEL=llama3.1

STACKLINE_AI_MEMORY=true
STACKLINE_AI_MEMORY_PATH=./data/memory.sqlite

STACKLINE_AI_RAG=true
RAG_DATABASE_URL=postgres://readonly_user:password@127.0.0.1:5432/app
RAG_MIN_QUERY_LENGTH=2
RAG_LIMIT=4
```

## Scenario 8: Express Backend

Use this when your backend is Express. The Stackline handler uses Web
`Request`/`Response`, so you need an adapter.

```bash
npm init -y
npm pkg set type=module
npm install express @stackline/ai @stackline/ai-server @stackline/ai-ollama
```

If you want Express plus UI:

```bash
npm install @stackline/ai-ui
npm install -D vite
```

Do not run `express.json()` before the Stackline route unless you intentionally
rebuild the body for the Fetch-compatible handler.

## Scenario 9: Existing Backend, UI Only

Use this only when your backend already provides compatible routes.

```bash
npm install @stackline/ai-ui
```

Your backend must return:

```text
GET /api/ai/models -> { "models": [{ "id": "llama3.1" }] }
POST /api/ai/chat  -> { "message": { "role": "assistant", "content": "..." } }
```

## Model Rule

For first installs, use an explicit model from `ollama list`:

```bash
ollama list
```

Then set the same value in backend and UI:

```bash
OLLAMA_MODEL=llama3.1
```

```html
<stackline-ai-studio model="llama3.1"></stackline-ai-studio>
```

`model="auto"` is supported, but explicit models are easier to debug when a new
environment is being installed.
