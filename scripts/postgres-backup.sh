#!/usr/bin/env bash

set -euo pipefail

output=${1:?Usage: bun run db:backup -- <new-backup-file>}
database=${DB_DATABASE:-starter}
username=${DB_USERNAME:-starter}
completed=false
compose=(docker compose)

if [[ -n "${POSTGRES_ENV_FILE:-}" ]]; then
    compose+=(--env-file "$POSTGRES_ENV_FILE")
fi

if [[ -e "$output" ]]; then
    echo "Refusing to overwrite an existing backup: $output" >&2
    exit 1
fi

cleanup() {
    if [[ "$completed" != true ]]; then
        rm -f -- "$output"
    fi
}

trap cleanup EXIT INT TERM
umask 077

"${compose[@]}" exec -T postgres \
    pg_dump \
    --username "$username" \
    --dbname "$database" \
    --format custom \
    --no-owner \
    --no-privileges \
    >"$output"

if [[ ! -s "$output" ]]; then
    echo "PostgreSQL produced an empty backup." >&2
    exit 1
fi

completed=true
echo "PostgreSQL backup written to $output."
