# Domain context

This glossary records terms whose meaning must stay stable across documentation, contracts, code, and interface.

## Identity and authorization

**User**: authenticated identity maintained by Laravel. Represents the person who starts a session and receives roles and permissions.

_Avoid_: `Account`, since that name is reserved for a future business account or organization; `Member` as a synonym for the authenticated person.

**member**: default role assigned to a `User`. It is not a different kind of user.

**admin**: administrative role assigned to a `User`. The role does not replace Policies and Gates in authorizing actions.

## Reference asynchronous flow

**Task**: the reference asynchronous resource. Owned by a single `User`, it moves through the states `queued`, `processing`, `completed`, or `failed`, and its persisted state is always the source of truth over any realtime notification.

**Idempotency Key**: opaque string a client sends with a mutating request so a retry can never create a second logical operation. Scoped to a `User` and an operation name.

**Correlation ID**: identifier that follows one request through HTTP response headers, logs, jobs, and realtime events. Accepted from the client or generated at the edge.
