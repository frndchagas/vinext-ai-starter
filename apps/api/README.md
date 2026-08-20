# Laravel API

Laravel owns authentication, authorization, persisted domain state, queues and broadcasts for the starter.

Run focused checks from this directory:

```bash
composer format:check
composer lint
composer test
```

Use the root `bun run dev` command for the complete same-origin stack. Public HTTP changes begin in `../../contracts/http/main.tsp`; realtime channels and payloads begin in `../../contracts/realtime/asyncapi.yaml`.
