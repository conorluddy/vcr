#!/bin/sh
set -eu
HERE=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
MODE=${1:-}
if [ -n "$MODE" ] && [ "$MODE" != "--record" ]; then
  echo "usage: $0 [--record]" >&2
  exit 2
fi
mkdir -p "$HERE/output"
node "$HERE/run.mjs" "$MODE"
