# Express Guide

`@stackline/ai-server` is Fetch-compatible. Express is not Fetch-compatible by
default, so adapt `req` and `res`.

Do not do this:

```js
app.use(handleAI);
```

Use the pattern in `examples/express-adapter`:

```js
app.use("/api/ai", async (req, res, next) => {
  try {
    const request = await requestFromExpress(req);
    const response = await handleAI(request);
    await writeExpressResponse(res, response);
  } catch (error) {
    next(error);
  }
});
```

Do not run `express.json()` before this route unless your adapter deliberately
reconstructs a Web `Request` body.

