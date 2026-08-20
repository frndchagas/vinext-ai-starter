# API conventions

These conventions must appear in TypeSpec and in tests before the first domain endpoint.

## Addressing and types

- domain endpoints use the `/api/v1` prefix;
- resources use UUIDv7 as the primary key and the client treats them as opaque strings;
- dates and times use ISO 8601 in UTC;
- monetary values, when they exist, use an integer in the smallest unit and a separate currency code;
- optional fields and nullable fields are treated as different concepts.

## Responses and errors

- success returns the resource or a collection directly, without envelopes that differ per endpoint;
- errors follow Problem Details for HTTP APIs, RFC 9457;
- validation errors include a stable map of fields to messages;
- domain error codes are machine-readable and do not depend on the text shown to the user;
- every response includes or propagates the correlation ID.

## Collections

- potentially large collections use cursor-based pagination;
- filters and sorting must be declared in TypeSpec;
- paginated responses report the next cursor and do not expose internal database details.

## Asynchronous mutations

- creation accepts `Idempotency-Key` when repeating the call could duplicate work;
- the initial response persists and returns the resource with an explicit state;
- the client queries that resource through the API, even when it also receives Reverb notifications;
- a client retry must never create a second logical operation.

## Compatibility

Oasdiff will compare the proposed OpenAPI with the last published version. Incompatible changes will require a new API version or a documented compatible transition. Adding an optional field still requires regenerating the client and running contract tests.

## Authentication

The Fortify endpoints used by the SPA are part of the contract consumed by the frontend, even when their implementation is provided by the framework. This includes current session, registration, login, logout, password recovery, password reset, and email verification.
