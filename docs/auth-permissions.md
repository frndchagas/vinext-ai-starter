# Authentication and permissions

## Version 0.1 setup

Laravel will be the single source of identity and authorization:

- Fortify implements registration, login, logout, password recovery, and email verification;
- Sanctum authenticates the Vinext SPA via session cookie;
- Spatie Laravel Permission persists roles and permissions;
- Policies and Gates protect resources and operations;
- Reverb authorizes private channels through the same Laravel guard.

The frontend, the API, and Reverb will be exposed on the same origin. The proxy will forward the Fortify, Sanctum, and broadcasting paths to Laravel. Cookies will be `Secure` in production, `HttpOnly` where applicable, and configured with `SameSite=Lax`. State changes will require the Sanctum CSRF token.

## HTTP surface

The Fortify routes live under the versioned prefix `/api/v1/auth/*`, without duplicating their controllers:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password`
- `GET /api/v1/auth/verify-email/{id}/{hash}`
- `POST /api/v1/auth/email/verification-notification`

`GET /sanctum/csrf-cookie` remains an infrastructure route, outside the prefix. The current identity lives at `GET /api/v1/me`, returning the User, roles, permissions, and email verification state, without exposing the session-based implementation. All of these endpoints go into the TypeSpec contract.

## Registration, verification, and the first admin

- Registration is controlled by configuration (`FEATURE_REGISTRATION`), enabled in the template and in local environments. An application can turn it off without removing code.
- A User without a verified email can only access login, the current session (`/api/v1/me`), verification resend, and logout. Product endpoints and private channels require a verified email.
- The first admin is promoted through an explicit, auditable command: `php artisan app:grant-admin usuario@example.com`. The User registers normally and the promotion happens outside the public flow. Deterministic user seeders are restricted to development and tests.

## Functional scope

The starter will begin with the `admin` and `member` roles. Example permissions will use stable names, such as `users.view`, `users.manage`, and `settings.manage`. An idempotent seeder will sync the permissions defined in code.

The frontend may receive the User's capabilities to hide or disable controls. This serves only the interface experience. Every sensitive read and every mutation will remain protected by a Policy or Gate in Laravel.

The authentication endpoints used by the frontend will also be in TypeSpec. This avoids hand-written types for the authenticated User, validation errors, and session states.

## Session and real time

- the `/api/broadcasting/auth` endpoint will require the same Sanctum session;
- the private channel `users.{userId}` is part of the core: it proves Sanctum, broadcasting authorization, and Reverb without inventing a domain. Per-resource channels arrive together with the asynchronous example;
- private channels will validate both the identity and access to the resource, and will require a verified email;
- logout will end the session in Laravel and disconnect Echo in the frontend;
- an Echo reconnection will never grant access without a new authorization from the backend.

## Extensions kept in the plan

These capabilities stay out of version 0.1 but remain in the starter's plan:

- 2FA with TOTP and recovery codes via Fortify;
- WebAuthn passkeys via Fortify and the official `@laravel/passkeys/react` client;
- social login via Laravel Socialite, configured per provider;
- teams and organizations after we define data ownership, context switching, invitations, and permission scoping.

Each extension will have its own screens, states, rate limits, and E2E tests. 2FA and passkeys can reuse the current session. Social login needs to handle account linking. Teams affect the authorization model, unique keys, and private channels, so they will not be just an additional table.

Until there is an installer, these items will be extension guides, as described in [Extensions and recipes](extensions.md).

## Better Auth

Better Auth is a good option when the authentication server is also TypeScript. It will not be used in this architecture because it would create a second source of sessions and identity outside Laravel, while Policies, Gates, and Reverb would still depend on the PHP backend.

A fully TypeScript variant may evaluate Better Auth in the future. The Vinext + Laravel starter stays with Fortify, Sanctum, and Spatie.
