# SQLite Memory Guide

Install:

```bash
npm install @stackline/ai @stackline/ai-memory-sqlite
```

Use:

```js
import { createSqliteMemoryStore } from "@stackline/ai-memory-sqlite";

const memory = createSqliteMemoryStore({
  path: "./data/memory.sqlite",
  indexAssistantResponses: true,
  indexUserMessages: true,
});
```

Pass it to the core:

```js
memory: {
  store: memory,
  captureConversation: {
    writeMode: "await",
    mode: "both",
  },
}
```

Call `memory.close()` on shutdown.

