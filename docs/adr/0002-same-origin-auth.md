# ADR 0002: same-origin authentication

Status: accepted.

## Context

The Vinext SPA needs to share a session with Laravel and authorize private channels on Reverb. Splitting frontend, API, and WebSocket across different origins increases the configuration of cookies, CORS, CSRF, and broadcasting.

## Decision

The browser will use a single origin published by Caddy. The proxy will forward pages to Vinext, API and authentication routes to Laravel, and the native `/app/*` and `/apps/*` paths to Reverb, without stripping their prefixes. Fortify will provide the identity flows, Sanctum will authenticate the SPA via cookie, and the same guard will authorize private channels at `/api/broadcasting/auth`.

The initial core will have registration, login, logout, password recovery, and email verification. The `admin` and `member` roles will be persisted by Spatie Laravel Permission, and Policies and Gates will remain responsible for the actual authorization.

## Alternatives considered

### Better Auth

Not adopted. It would move sessions to the TypeScript frontend, but Laravel would remain responsible for authorizing the domain and Reverb. That would create two sources of identity and an extra bridge.

### Bearer tokens in the browser

Not adopted. The SPA is a first-party client and can use Sanctum's session and CSRF flow, without storing tokens accessible to JavaScript.

## Consequences

- development, E2E, and production must reproduce the same proxy topology;
- the frontend uses only relative URLs and does not know the services' internal ports;
- the session flow still requires the CSRF cookie and the `X-XSRF-TOKEN` header, even without CORS;
- Fortify endpoints consumed by the frontend go into TypeSpec;
- logout also closes the Echo connection;
- CORS will not be used as the primary solution for the SPA;
- 2FA, passkeys, social login, and teams will be later extensions, without changing Laravel as the source of identity.
