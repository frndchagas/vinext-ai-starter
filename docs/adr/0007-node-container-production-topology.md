# ADR 0007: Node container production topology

Status: accepted.
Implementation: pending.

The supported production reference will run Vinext on Node behind Caddy, with separate Laravel API, Horizon worker and Reverb processes backed by PostgreSQL and Redis. The first deployable release will include Dockerfiles, a production Compose file, a CI build smoke test and a generic Coolify example. Consumers will build images from the source tag. Public images and attestations may be added after there is demand. Cloudflare Workers may be added later as a separate deployment variant.
