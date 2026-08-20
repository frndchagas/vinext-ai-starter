# AI-first developer experience

## Definition

An AI-first repository makes the work explicit. A person or an agent can discover the structure, make a change, run the appropriate verification, and present evidence using the same commands.

The model may be probabilistic. Accepting the change will not be.

## Core of version 0.1

### 1. Short instructions

The root `AGENTS.md` will contain only:

- a short map of the repository;
- the official commands;
- autonomy and safety limits;
- the definition of done;
- links to specific instructions.

`apps/api/AGENTS.md` will cover Laravel conventions. `apps/web/AGENTS.md` will cover Vinext, React, and components. Long documentation stays in `docs/`, without being copied into instruction files.

### 2. Stable commands

The root `package.json` will be the common interface for development and CI. Commands must be non-interactive, fail with the correct exit code, and work the same way for people and agents.

There will be no dedicated `repo` CLI in the initial version. There will also be no MCP or automatic generation of a repository summary. These layers will only be considered if the simple commands prove insufficient in real use.

### 3. Clear local automation

Lefthook will run fast checks before commits and pushes. Gitleaks will look for keys, tokens, and passwords accidentally included in the diff. That is what blocking secrets means: preventing a credential from reaching the Git history, without trying to interpret the developer's intent.

Generated code will be verified by a drift command and by CI. The repository will not try to block every manual edit with a collection of complex hooks.

### 4. Contracts as executable context

TypeSpec, OpenAPI, and AsyncAPI will explain the boundaries better than duplicated documentation. An agent can generate the client, run the contract tests, and immediately find out whether the frontend, backend, or events have drifted.

### 5. A skill only when there is a stable flow

The starter will not begin with seven skills. Once the foundation is proven, it may include a single optional skill for developing and validating a vertical change. It should only guide the use of the existing commands, without duplicating rules or creating its own runtime.

## Source of truth

| Subject | Canonical source |
| --- | --- |
| Architecture and decisions | `docs/` and ADRs |
| Instructions for agents | root and per-app `AGENTS.md` |
| HTTP contract | TypeSpec |
| Realtime contract | AsyncAPI |
| Database | Laravel migrations |
| Verifications | `package.json` and Composer scripts |
| Installed versions | `bun.lock`, `composer.lock`, and pinned images |

Adapters for specific tools may only point to the `AGENTS.md`. We will not maintain long, divergent copies for each agent.

## Suggested autonomy limits

| Action | Default rule |
| --- | --- |
| Read code, documentation, and local logs | Allowed |
| Change files within the current request | Allowed |
| Run tests and formatters | Allowed |
| Add a dependency | Requires justification and validation |
| Update a visual baseline or golden file | Requires human review |
| Change an already published migration | Not allowed |
| Use the network during tests | Not allowed |
| Publish a package, image, or deploy | Requires human approval |

## Success criteria

The starter will be considered AI-first when a new contributor can locate the rules, implement a small change, and get an objective diagnosis without depending on oral knowledge of the project. The number of automations will not be a success metric.
