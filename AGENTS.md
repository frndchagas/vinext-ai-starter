# Repository instructions

## Map

- `apps/web`: Vinext frontend, React, shadcn/ui and Tailwind CSS.
- `apps/api`: Laravel API and the source of truth for identity and domain state.
- `packages/api-client`: generated TypeScript client. Do not hand edit generated files.
- `packages/config`: shared TypeScript configuration.
- `docs/`: architecture guides. Decision records live in `docs/adr/`.
- `CONTEXT.md`: domain glossary. Use its canonical terms in code, contracts and UI.

## Commands

- `bun run format`: format TypeScript and PHP.
- `bun run check`: run formatting checks, lint, types, unit tests and build.
- `bun run dev`: start the web and API development servers.

## Rules

- Keep public HTTP types in the contract once `contracts/http` exists.
- Keep authentication, authorization and persisted domain state in Laravel.
- Do not add a second formatter, linter or package manager.
- Tests must not use real external services.
- Never commit `.env`, credentials or generated runtime artifacts.
- Update the relevant decision document when architecture changes.
