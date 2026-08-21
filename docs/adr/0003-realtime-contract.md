# ADR 0003: realtime contract

Status: accepted.
Implementation: partial.

AsyncAPI defines contracted Reverb channels and message payloads; OpenAPI remains limited to HTTP. Realtime messages report state that is already persisted, and consumers rebuild current state through the API after disconnection. Duplicates and loss are possible. Generated TypeScript models and PHP event conformance tests will make channel names and payloads executable without adding schema validation to the production broadcast path.

Hand-written TypeScript event types were rejected because they duplicate the neutral contract. Event sourcing was rejected because the starter needs change notifications rather than a durable event log. CI currently validates AsyncAPI syntax but does not yet detect drift between the document and PHP automatically.
