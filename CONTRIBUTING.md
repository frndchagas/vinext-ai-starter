# Contributing

Thanks for helping improve the starter. The project optimizes for one thing: a
repository where humans and coding agents can work with little ambiguity.

## Setup

```bash
bun run bootstrap   # install JS and PHP deps, start Docker services, migrate
bun run dev         # web on :13000 through Caddy, API, Horizon and Reverb
```

Requirements are listed in the README. `AGENTS.md` files at the root and inside
each app describe the layout and the rules that also apply to human contributors.

## Before you push

```bash
bun run check            # format, lint, types, unit tests and build
bun run contracts:check  # recompile TypeSpec, regenerate the client, fail on drift
cd apps/web && bun run test:e2e   # full flow against the running dev stack
```

`bunx lefthook install` wires the same gates as git hooks. CI runs them all
again and is the authority; a green local run is a courtesy, not a proof.

## Changing the API surface

The HTTP contract in `contracts/http/main.tsp` is the source of truth. Change
the TypeSpec first, run `bun run contracts:build`, commit the regenerated
OpenAPI and client together with the Laravel implementation, and cover the new
behavior with feature tests. Breaking changes are flagged by oasdiff in CI and
need a documented, compatible transition. Realtime channels and payloads live
in `contracts/realtime/asyncapi.yaml`.

## Decisions and vocabulary

Architecture decisions live in `docs/adr/`; the domain glossary lives in
`CONTEXT.md`. If your change contradicts either, update the document in the
same pull request or open the discussion first.
