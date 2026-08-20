# API instructions

- Laravel owns identity, authorization, domain state, queues and broadcasts.
- Use Form Requests for input, API Resources for output and Policies for resource authorization.
- Dispatch jobs and broadcast events only after the surrounding transaction commits.
- Keep controllers thin and avoid abstractions without a concrete boundary.
- Run `composer format:check`, `composer lint` and `composer test` for focused changes.
