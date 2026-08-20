# Authentication and authorization

## Current behavior

Laravel is the only identity source. Fortify handles registration, login, logout, password reset, email verification and password-confirmation infrastructure. Sanctum authenticates the first-party SPA with a session cookie and CSRF protection.

The application consumes these versioned routes:

- registration, login and logout;
- forgot-password and reset-password;
- signed email verification and verification resend;
- `GET /api/v1/me` for the current User.

Fortify also registers password-confirmation status and submission routes under `/api/v1/auth/user/*`. The current UI does not call them. They will become part of the generated application contract when profile or TOTP screens consume them.

`GET /sanctum/csrf-cookie` and `POST /api/broadcasting/auth` are framework protocol endpoints. They are called directly by the session and Echo clients rather than through generated product hooks.

## Verification and access

Registration is controlled by `FEATURE_REGISTRATION`. A newly registered User receives the `member` role and must verify their email before accessing Tasks or private channels.

The `admin` and `member` roles and example permissions are persisted by an idempotent seeder and returned by `/api/v1/me`. They provide an authorization foundation. Current Task access is enforced by ownership Policy; no product operation is gated by role or permission yet.

The first admin is promoted explicitly:

```bash
cd apps/api
php artisan app:grant-admin user@example.com
```

## Sessions and realtime

Echo authorizes every private subscription through the same Laravel session. Logout disconnects Echo. Reconnection requires fresh channel authorization and then refetches persisted state.

## Accepted work not implemented

ADR 0009 adds profile settings, password changes and optional per-User TOTP with recovery codes to the core. Its implementation is pending. Passkeys, social login, SSO and teams remain outside the core.
