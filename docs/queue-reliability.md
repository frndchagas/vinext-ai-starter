# Queue reliability

## Reference flow

The example resource will use `POST /api/v1/tasks` and the states `queued`, `processing`, `completed`, or `failed`. The name is generic on purpose: it demonstrates the flow without carrying rules from a specific product into the starter.

## HTTP idempotency

The endpoint will require the `Idempotency-Key` header. Laravel will store a row with:

- authenticated User;
- operation name;
- idempotency key;
- hash of the normalized payload;
- ID of the created resource;
- status code and body of the first response.

The database will have a unique constraint on User, operation, and key. Repeating the key with the same payload returns the same resource without creating another job. Repeating the key with a different payload returns `409` with the code `idempotency_key_reused`.

## Transaction and dispatch

The first request will open a transaction to write the idempotency record and the resource in the `queued` state. The job will be dispatched with `afterCommit()`. If the transaction fails, nothing goes to the queue.

The job will implement `ShouldBeUnique`, with `uniqueId()` equal to the resource ID. The Redis lock reduces concurrent dispatches but will not be treated as a single-execution guarantee. The handler itself will check the persisted state before producing external effects.

## Retries and timeout

The reference job will have:

```text
tries: 3
timeout: 120 seconds
failOnTimeout: true
backoff: 10, 60 seconds
```

The Horizon supervisor timeout will be greater than 120 seconds, and the Redis `retry_after` will be greater than the supervisor timeout. The initial configuration will be 125 seconds for the supervisor and 150 seconds for `retry_after`.

Transient errors will be rethrown to allow retries. Permanent errors will fail without wasting attempts. The `failed()` method will persist the `failed` state, a safe error code, and the completion time.

## Idempotent processing

The handler will follow these rules:

1. If the resource is already `completed` or `failed`, it exits without repeating the work.
2. The transition to `processing` uses a conditional update to prevent two active workers on the same resource.
3. External calls receive an idempotency key derived from the resource ID whenever the provider supports it.
4. The result and the `completed` state are written in the same transaction.
5. Failures do not persist tokens, sensitive prompts, or stack traces in the field shown to the User.

## Event after commit

`TaskStatusChanged` will implement `ShouldBroadcast` and `ShouldDispatchAfterCommit`. The event is only queued after the new state is confirmed in PostgreSQL. The payload will have ID, state, version, timestamp, and correlation ID.

Reverb remains a best-effort notification. If the broadcast fails after the commit, the state is not lost. The frontend will recover the current version through the API on reconnection, on regaining focus, or on receiving any later event for the resource.

## Required tests

- two concurrent requests with the same key create one resource and one logical job;
- the same key with a different payload returns `409`;
- rollback dispatches neither job nor event;
- retry does not repeat a completed external effect;
- timeout ends in `failed` after the configured policy;
- the event observes the already confirmed state;
- reconnection recovers the state through the API even without receiving the event.
