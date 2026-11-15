#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
node run.mjs
if [[ "${1:-}" == "--record" ]]; then cp output/summary.json expected/summary.json; echo "recorded expected/"; exit 0; fi
diff -u expected/summary.json output/summary.json
echo "jimp-invert: OK"
