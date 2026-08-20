# ADR 0003: realtime contract

Status: accepted.

## Context

Reverb will be present from the first version. Typing only HTTP would leave WebSocket channels and payloads as implicit contracts between PHP and TypeScript.

## Decision

AsyncAPI will be the canonical source for Reverb's public channels, message names, and payloads. OpenAPI remains exclusive to HTTP.

Events will be notifications of a change already persisted. The frontend may use them to update or invalidate a query, but it will always be able to rebuild the current state through the API. Consumers must tolerate duplicate messages and loss during disconnection.

## Alternatives considered

### Hand-written TypeScript types

Not adopted. They would duplicate the definition present in the Laravel events and would not provide a neutral specification for validation.

### Using only OpenAPI

Not adopted. OpenAPI describes HTTP requests and responses well, but does not model asynchronous channels and messages the way AsyncAPI does.

### Event sourcing in the core

Not adopted. The starter needs realtime notifications, not a complete event log. Products that need that guarantee can add an outbox and a broker as an extension.

## Consequences

- public channels and messages start in AsyncAPI;
- CI checks the contract's validity and drift;
- tests confirm authorization and payload shape;
- state in PostgreSQL remains the source of truth;
- reconnection triggers a fresh query to the API.
