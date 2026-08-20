# Vinext AI Starter for Laravel

[![CI](https://github.com/frndchagas/vinext-ai-starter/actions/workflows/ci.yml/badge.svg)](https://github.com/frndchagas/vinext-ai-starter/actions/workflows/ci.yml)

An AI-first SaaS starter powered by Vinext and Laravel.

The repository is in its foundation phase. It currently proves Vinext on Node, Laravel 13 as an API, shadcn/ui with Base UI, Bun workspaces, Turborepo and the first mechanical quality gate.

## Requirements

- Bun 1.4
- Node.js 24 or newer
- PHP 8.5
- Composer 2.10

## Setup

```bash
bun install --frozen-lockfile
composer install --working-dir apps/api --no-interaction
bun run check
```

Use `bun run dev` to start Vinext, Laravel, Horizon and Reverb. The defaults are port 13000 for the web app, 18000 for Laravel and 19080 for Reverb.

PostgreSQL listens on 15432, Redis on 16379, Mailpit SMTP on 11025 and the Mailpit interface on 18025. These defaults avoid common local service ports and can be changed in the root `.env` file.

## Commands

```text
bun run dev            Start web and API
bun run format         Format TypeScript and PHP
bun run format:check   Check formatting
bun run lint           Run Oxlint and Larastan
bun run typecheck      Run TypeScript type checking
bun run test           Run Vitest and PHPUnit
bun run build          Build the Vinext application
bun run config:check   Validate Composer and Docker Compose configuration
bun run check          Run the standard quality gate
```

## Repository layout

```text
apps/web             Vinext, React, shadcn/ui and Tailwind CSS
apps/api             Laravel API
packages/api-client  Generated HTTP client, added with the contract phase
packages/config      Shared TypeScript configuration
docs                 Architecture guides and decision records
CONTEXT.md           Domain glossary
```

## Documentation

- [Architecture](docs/architecture.md)
- [API conventions](docs/api-conventions.md)
- [Authentication and permissions](docs/auth-permissions.md)
- [Monorepo organization](docs/monorepo.md)
- [Realtime contracts](docs/realtime-contracts.md)
- [Queue reliability](docs/queue-reliability.md)
- [Determinism](docs/determinism.md)
- [Frontend quality](docs/frontend-quality.md)
- [AI-first developer experience](docs/ai-first-dx.md)
- [Extensions](docs/extensions.md)
- [Decision records](docs/adr)
- [Domain glossary](CONTEXT.md)

## Independence

This is an independent community project. It is not affiliated with, sponsored by or endorsed by Cloudflare or the Laravel team. Vinext, Laravel and other trademarks belong to their respective owners.

## License

[MIT](LICENSE)
