# ADR 0004: UUIDv7 as the primary identifier

Status: accepted.

## Context

The starter has not yet published a stable schema. Keeping an internal numeric key plus a separate public identifier would add columns, mappings, and recurring decisions without proven benefit at this stage.

## Decision

`User` and the domain resources will use UUIDv7 as the primary key. Related columns, including polymorphic relations pointing to these resources, will use the same compatible type.

The HTTP contracts will represent these identifiers as opaque strings. The client must not infer ordering, creation date, or any rule from the value.

## Alternatives considered

### Internal integer and public UUID

Not adopted. It would preserve smaller indexes in the database, but would create two identifiers for each resource and more conversion points in the contract.

### Random UUID

Not adopted. UUIDv7 keeps the distributed-identifier property and offers better temporal locality for indexes.

## Consequences

- migrations, factories, models, policies, and tests must treat IDs as UUIDs;
- Spatie Laravel Permission's polymorphic tables must use compatible columns;
- IDs remain opaque outside the server;
- a future change of strategy will require a migration and must be recorded in a new decision.
