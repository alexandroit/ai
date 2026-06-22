# HTTP API Reference

Default base path: `/api/ai`.

The handler is Fetch-compatible:

```ts
type StacklineAIHttpHandler = (request: Request) => Promise<Response>;
```

## Endpoints

| Method | Path | Purpose | Request | Response | Errors |
| ------ | ---- | ------- | ------- | -------- | ------ |
| `GET` | `/api/ai/health` | Health and mode | none | `{ "ok": true, "mode": { ... } }` | `404` outside base path |
| `GET` | `/api/ai/manifest` | Route manifest | none | `{ "name": "Stackline AI", "mode": { ... }, "routes": [...] }` | `404` outside base path |
| `GET` | `/api/ai/models` | List provider models | none | `{ "models": StacklineAIModel[] }` | provider errors as `400` |
| `POST` | `/api/ai/chat` | Send chat request | `StacklineChatRequest` JSON | `{ "message": StacklineChatResponse, "content": string, "model": string }` | validation/provider errors as `400`, model policy as `403` |
| `OPTIONS` | `/api/ai/*` | CORS preflight | headers | empty `204` | none |

## Chat Request

```json
{
  "model": "auto",
  "messages": [
    {
      "role": "user",
      "content": "Explain Stackline AI."
    }
  ],
  "temperature": 0.2,
  "metadata": {
    "sessionId": "session-1",
    "userId": "user-1"
  }
}
```

Allowed roles:

- `system`
- `user`
- `assistant`
- `tool`

## Chat Response

```json
{
  "message": {
    "role": "assistant",
    "content": "Stackline AI keeps UI and provider credentials separated.",
    "model": "llama3.1",
    "metadata": {
      "stacklineRag": {
        "enabled": true,
        "contextCount": 1,
        "sources": []
      }
    }
  },
  "content": "Stackline AI keeps UI and provider credentials separated.",
  "model": "llama3.1"
}
```

## Error Response

```json
{
  "error": {
    "message": "messages must be an array.",
    "status": 400
  }
}
```

## Body Limit

`maxBodyBytes` defaults to `262144` bytes. Oversized bodies return `400`.

## CORS

CORS is opt-in through `cors`:

```js
createStacklineAIHttpHandler({
  server: ai,
  cors: {
    origins: ["https://app.example.com"],
    credentials: true,
  },
});
```

Use restrictive origins in production.

