# ADR 0005: versioned authentication surface under /api/v1/auth

Status: accepted.

## Context

By default, Fortify registers loose routes such as `/login`, `/register`, and `/forgot-password`. The starter, however, publishes a type-first HTTP contract in TypeSpec, and the authentication endpoints are part of that contract. Routes outside the versioned prefix would become untyped, unversioned exceptions.

## Decision

Fortify's routes will be registered under the `/api/v1/auth/*` prefix, reusing the native controllers, without duplication. `GET /sanctum/csrf-cookie` remains an infrastructure route outside the prefix. The current identity will be exposed at `GET /api/v1/me`.

## Alternatives considered

### Loose Fortify routes

Not adopted. The routes would sit outside the versioned contract and create two path conventions in the same API.

### Custom controllers wrapping Fortify

Not adopted. It would duplicate validation, throttling, and flows already solved by Fortify, increasing the maintenance surface with no gain at this stage.

## Consequences

- the TypeSpec contract covers registration, login, logout, recovery, reset, and email verification;
- the frontend uses only versioned paths, except for the infrastructure CSRF cookie;
- a surface change will be a contract change, detectable by oasdiff;
- Fortify's configuration (prefix and disabled views) becomes part of the starter's foundation.
