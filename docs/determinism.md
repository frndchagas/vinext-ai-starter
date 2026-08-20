# Determinism and quality gates

## What determinism means here

We do not expect two agents to write the same code. We expect valid implementations to respect the same contracts and pass the same proofs.

## Reproducible environment

- `devcontainer.json` under version control;
- base images pinned by version and by digest in releases;
- exact versions of Bun, PHP, and Composer recorded;
- `bun.lock` and `composer.lock` required;
- JavaScript installed with a frozen lockfile and isolated linker;
- real PostgreSQL and Redis in integration tests;
- `TZ=UTC`, fixed locale, and UTF-8;
- clock, IDs, and seeds controllable in tests;
- ports isolated per worktree to allow parallel runs.

The Dev Container will be the reference. Native development remains allowed when it uses the same recorded versions.

## Task graph and cache

Turborepo will model web, API, generated client, and contracts as separate packages. The Laravel `package.json` will expose only commands that call Composer, Artisan, and the PHP binaries. PHP dependencies stay in `composer.json`.

Only deterministic tasks will be cached: lint, typecheck, unit tests, contract generation, and build. Migrations, integration, E2E, queue, Reverb, development commands, and any task with network or external state always run again.

In version 0.1, the cache will be local. Remote caching is deferred until we have CI metrics and a trust policy for shared artifacts.

## Generated artifacts

```text
TypeSpec --> OpenAPI 3.1 --> Orval --> client, types, Zod, and MSW
                |              |
                |              +--> drift comparison
                +--> Prism and oasdiff

AsyncAPI ---------------------------> drift comparison
```

`contracts:check` will compile the contracts and regenerate the artifacts in a temporary directory. An uncommitted diff fails. The integration gate will run the API behind Prism, and oasdiff will identify breaking changes.

## Test layers

### Standard verification

Runs on every pull request:

- Oxfmt and Pint;
- Oxlint and Larastan;
- TypeScript;
- PHPUnit and Vitest;
- drift of OpenAPI, AsyncAPI, and the Orval client;
- Gitleaks;
- `vinext check` and build.

### Deep integration

Runs when the flow touches database, contract, queue, authentication, or WebSocket:

- real PostgreSQL and Redis;
- migrations run from scratch;
- requests and responses validated by Prism;
- idempotent job with retry, timeout, and dispatch after commit;
- private channel authorization;
- state persistence before the Reverb event;
- correlation ID propagation.

There will be no schema dump in version 0.1. A clean install must build the database from migrations alone.

### Schema dump policy

Laravel calls this artifact a schema dump. It contains no test data and does not replace backups. The project will only adopt it when there are more than 100 migrations or when `migrate:fresh` takes more than 30 seconds in three consecutive CI runs.

When one of these thresholds is reached:

1. a dedicated pull request will run `php artisan schema:dump` against the pinned PostgreSQL version;
2. `database/schema/pgsql-schema.sql` will be version-controlled and never hand-edited;
3. `--prune` will not be used in the starter, to preserve the migration history;
4. CI will test bootstrapping from the dump plus the later migrations;
5. CI will also replay all migrations with the dump temporarily disabled;
6. the dump will only be regenerated after the corresponding migrations are on the main branch.

If the two paths produce different schemas, the pull request fails. The dump speeds up new installs, but migrations remain the auditable history of the database.

### E2E

Playwright will cover the main vertical flow with fixed locale, timezone, viewport, and seed. CI will keep the trace on the first retry. Selectors will use role, label, or an explicit `data-testid` when needed, without depending on DOM position.

### Release diagnostics

Before a release, React Doctor, Knip, and dependency-cruiser will run with pinned versions. Their results will be reviewed without introducing a second lint chain.

## AI features

AI tests in version 0.1 will use fakes and structured outputs. The gates will verify schema, invariants, allowed tools, and size limits. No pull request test will call an external provider.

Fast-check, Infection, Promptfoo, and evals with real models are deferred. They may come in when there is AI logic or behavior important enough to justify the cost and maintenance.

## Planned public commands

```text
bun run bootstrap          # prepares the environment without prompts
bun run dev                # starts proxy, web, API, queue, and Reverb
bun run format:check       # Oxfmt and Pint
bun run lint               # Oxlint and Larastan
bun run typecheck          # TypeScript
bun run test               # PHPUnit and Vitest
bun run contracts:check    # contract drift and compatibility
bun run migrations:check   # full replay and schema dump, when it exists
bun run test:integration   # Postgres, Redis, Prism, queue, and Reverb
bun run test:e2e           # Playwright
bun run build              # vinext check and production build
bun run check              # standard verification
bun run check:full         # standard, integration, E2E, and diagnostics
```

The scripts may call Composer or each application's tools, but their public names remain stable.

## Dependency policy

- exact versions for runtimes and generators;
- isolated linker and allowlisted dependency scripts in Bun;
- lockfiles required;
- updates in a separate pull request;
- `vinext check`, build, and E2E on Vinext updates;
- no dependency with an install script without review;
- one tool per responsibility whenever possible.

## Acceptance criteria for a change

A change may be accepted when:

- the changed behavior has a test or reproducible evidence;
- `bun run check` passes;
- `bun run check:full` passes when the change touches a deep boundary or prepares a release;
- there is no hidden change to a contract, baseline, or generated code;
- the diff contains no secret or temporary artifact;
- the documentation reflects any modified architectural decision.
