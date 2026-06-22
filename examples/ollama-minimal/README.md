# Ollama Minimal

Minimal backend-only example using `@stackline/ai` and `@stackline/ai-ollama`.

```bash
cp .env.example .env
pnpm --filter stackline-ai-example-ollama-minimal start
```

The example lists installed Ollama models and sends one chat request. Use a
model returned by `ollama list`, or keep `OLLAMA_MODEL=auto`.
