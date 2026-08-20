# Realtime contract

## Decision

AsyncAPI will be the canonical source for the public channels, events, and payloads sent by Reverb. The contract will live in `contracts/realtime/`.

OpenAPI remains responsible for HTTP. AsyncAPI will document only the asynchronous side, without trying to describe the internal implementation of Laravel jobs.

## Conventions

- private channels use predictable names bound to the authorized resource;
- every message has a name, version, timestamp, correlation ID, and typed payload;
- payloads carry only the data needed to identify the change;
- the frontend invalidates or updates the corresponding query when it receives the event;
- state persisted in the API is always the source of truth;
- events contain no secrets, tokens, or data the User could not fetch through the API.

## Delivery and reconnection

The starter assumes at-least-once delivery and possible loss during disconnection. Consumers must therefore be idempotent and must not depend on receiving every event. On reconnection, the frontend re-fetches the active resources.

There will be no custom replay protocol in version 0.1. If a product needs auditing or reliable consumption, it should adopt an outbox and a proper broker as an extension, without turning Reverb into an event log.

## Example flow

```text
POST /api/v1/tasks
  -> persists task: queued
  -> dispatches job after commit
  -> responds 202 with the resource

worker
  -> task: processing
  -> task: completed or failed
  -> persists each state
  -> publishes TaskStatusChanged

Echo
  -> receives TaskStatusChanged on the private channel
  -> invalidates GET /api/v1/tasks/{id}
  -> renders the state returned by the API
```

The final names will be chosen during implementation, but the persist-before-broadcast pattern is mandatory.

## Verification

CI will validate the AsyncAPI document and fail when the generated artifact drifts. The integration test will confirm channel authorization, payload format, correlation ID, and state recovery after a simulated reconnection.
