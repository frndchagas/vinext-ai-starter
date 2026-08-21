# ADR 0003: realtime contract

Status: accepted.
Implementation: complete.

AsyncAPI defines contracted Reverb channels and message payloads; OpenAPI remains limited to HTTP. Realtime messages report state that is already persisted, and consumers rebuild current state through the API after disconnection. Duplicates and loss are possible. The official AsyncAPI CLI generates TypeScript models, and PHP conformance tests check the event name, channel and payload without adding validation to the production broadcast path.

Hand-written TypeScript event types were rejected because they duplicate the neutral contract. Event sourcing was rejected because the starter needs change notifications rather than a durable event log. The contract stays on AsyncAPI 3.0 because the official CLI 6.0.2 emits usable models for 3.0 but falls back to `Root = any` for this 3.1 document. The pin can be removed when model generation supports 3.1.
