# SQLite Memory Guide

Install:

```bash
npm install @stackline/ai@0.0.4 @stackline/ai-memory-sqlite@0.0.4
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

