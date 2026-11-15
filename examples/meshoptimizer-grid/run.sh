#!/bin/sh
set -eu
cd "$(dirname "$0")"
if [ "${1:-}" = "--record" ]; then
  node run.mjs --record
else
  node run.mjs
fi
