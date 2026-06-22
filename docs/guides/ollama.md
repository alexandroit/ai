# Ollama Guide

Install:

```bash
npm install @stackline/ai @stackline/ai-ollama
```

Use:

```js
import { createStacklineAIServer } from "@stackline/ai/server";
import { ollamaProvider } from "@stackline/ai-ollama";

const ai = createStacklineAIServer({
  provider: ollamaProvider({
    target: process.env.OLLAMA_TARGET || "http://127.0.0.1:11434",
    apiKey: process.env.OLLAMA_API_KEY,
    model: process.env.OLLAMA_MODEL || "auto",
  }),
  rag: false,
  memory: false,
});
```

Validate Ollama:

```bash
ollama list
curl http://127.0.0.1:11434/api/tags
```

Use explicit model names from `ollama list`, or use `model: "auto"`.

