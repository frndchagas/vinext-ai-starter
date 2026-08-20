# ADR 0009: profile, password and TOTP in core

Status: accepted.
Implementation: pending.

The authentication core will include profile settings, password changes and TOTP two-factor authentication with recovery codes. TOTP will be available by default, but each User will choose whether to enable it. Configuration will require the current password. Passkeys, social login, SSO and teams remain outside the core. Laravel continues to own identity, sessions and authorization.
