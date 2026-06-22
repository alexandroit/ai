# Express Adapter

`@stackline/ai-server` exposes a Fetch-compatible handler. Express receives
`req` and `res`, so this example adapts Express requests to Web
`Request`/`Response`.

Do not mount the handler directly with `app.use(handleAI)`, and do not run
`express.json()` before this route unless you build a separate adapter that
reconstructs the body safely.
