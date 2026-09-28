# Changelog

## 0.0.4 - 2026-09-28

- Standardize npm discovery metadata, documentation, compatibility guidance, and Stackline community links.
- Align internal workspace references with this release while preserving the public API.


- Normalizes configured base paths with a linear scanner, including very long
  leading and trailing slash runs.

## 0.0.3 - 2026-08-20

- Enforces `maxBodyBytes` during stream consumption and returns HTTP `413`.
- Requires an explicit model when `allowedModels` is active.
- Rejects wildcard CORS credentials and preflights outside the configured route.
- Adds no-store and nosniff response headers.
