#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p output expected
node run.mjs > output/first.json
node run.mjs > output/second.json
diff output/first.json output/second.json
if [[ "${1:-}" == "--record" ]]; then
  cp output/first.json expected/metrics.json
  echo "recorded expected/metrics.json"
else
  diff expected/metrics.json output/first.json
  echo "physically-based-materials: OK"
fi
