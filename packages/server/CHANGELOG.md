# Changelog

## 0.0.3 - 2026-08-20

- Enforces `maxBodyBytes` during stream consumption and returns HTTP `413`.
- Requires an explicit model when `allowedModels` is active.
- Rejects wildcard CORS credentials and preflights outside the configured route.
- Adds no-store and nosniff response headers.
