# ADR 0001: type-first API contract

Status: accepted.

## Context

The frontend uses TypeScript and the backend uses PHP. We need predictable types on both ends without maintaining duplicated manual interfaces.

## Decision

TypeSpec will be the canonical source for every HTTP boundary used by the frontend, including authentication. The compiler will emit OpenAPI 3.1. Orval will generate the TypeScript client, TanStack Query hooks, the required Zod schemas, and MSW mocks. Prism will validate requests and responses from the Laravel implementation. Oasdiff will detect breaking changes.

```text
TypeSpec
   |
   +-- OpenAPI 3.1 --> Orval --> Vinext
   |
   +-- Prism --------> Laravel
   |
   +-- oasdiff ------> compatibility between versions
```

Laravel will keep native types, DTOs, Form Requests, API Resources, enums, and static analysis. Type-first applies to the public boundary and does not replace the domain model.

## Alternatives considered

### oRPC, tRPC, and ts-rest

Not adopted. They deliver more value when server and client share TypeScript. On top of Laravel, they would add a second representation without eliminating HTTP or OpenAPI.

### Scramble

Not adopted as the canonical source. Scramble starts from the Laravel implementation and generates OpenAPI afterwards, while this starter defines the boundary before the implementation.

### Hey API and Kubb

They are valid alternatives for generating clients from OpenAPI. Orval was chosen for combining Fetch, TanStack Query, Zod, and MSW in a mature pipeline. The decision may be revisited if the maintenance or the quality of the generated code degrades.

## Consequences

- public changes start in TypeSpec;
- OpenAPI and the client are generated and receive no manual edits;
- authentication used by the SPA also has explicit types;
- CI fails when the artifacts diverge;
- integration goes through Prism;
- oasdiff flags compatibility breaks;
- backend and frontend can evolve in parallel using generated mocks.
