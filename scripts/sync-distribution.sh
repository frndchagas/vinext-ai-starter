#!/usr/bin/env bash

set -euo pipefail

if [[ $# -ne 2 ]]; then
    echo "Usage: $0 <generated-distribution> <distribution-repository>" >&2
    exit 64
fi

source_dir=$(cd "$1" && pwd -P)
target_dir=$(cd "$2" && pwd -P)

if [[ "$source_dir" == / || "$target_dir" == / || "$source_dir" == "$target_dir" ]]; then
    echo "Refusing unsafe distribution sync: $source_dir -> $target_dir" >&2
    exit 1
fi

if [[ ! -f "$source_dir/.source-commit" || ! -f "$source_dir/.source-tag" ]]; then
    echo "Generated distribution metadata is missing from $source_dir." >&2
    exit 1
fi

if [[ ! -d "$target_dir/.git" ]]; then
    echo "Distribution target is not a Git repository: $target_dir" >&2
    exit 1
fi

rsync --archive --checksum --delete --exclude '.git/' "$source_dir/" "$target_dir/"
