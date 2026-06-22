# HTTP Server

`@stackline/ai-server` exposes a Fetch-compatible handler:

```ts
type StacklineAIHttpHandler = (request: Request) => Promise<Response>;
```

Fetch-compatible runtimes can call it directly. Node `http`, Express, and Vite
middleware need adapters that translate their native request and response
objects to Web `Request` and `Response`.

The handler owns:

- base path routing;
- CORS preflight;
- model allow-listing;
- body size checks;
- chat payload validation;
- JSON error responses.

