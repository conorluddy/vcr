#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
node render.mjs
if [[ "${1:-}" == "--record" ]]; then mkdir -p expected; cp output/metrics.json expected/metrics.json; fi
diff -u expected/metrics.json output/metrics.json
echo "OK: fontsource-pinned-inter"
