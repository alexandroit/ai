# Security

Report security issues privately through the repository security advisory flow
or by contacting the maintainer listed on npm.

Do not include provider API keys, database credentials, private prompts, private
RAG documents, `.env` files, or production logs in public issues.

Production applications should add authentication, authorization, rate limiting,
restrictive CORS, body limits, model allow-lists, tenant filters, and safe
logging around Stackline AI routes.

Release validation recursively reviews the complete installed dependency tree.
A release is blocked by install warnings, invalid dependency trees, known audit
findings, or an archived runtime dependency without an approved maintained
replacement.
