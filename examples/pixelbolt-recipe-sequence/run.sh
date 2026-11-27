#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
# Installs the pinned dependencies when missing; fails if that cannot be done.
if [ ! -d node_modules/pixelbolt ] || [ ! -d node_modules/pngjs ]; then
  pnpm install >/dev/null
fi
npm run --silent run -- "$@"
