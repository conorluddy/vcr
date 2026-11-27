#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p output
# Live network, structural facts only. An unreachable API is reported as SKIPPED, never as a pass.
code=0
node check.mjs || code=$?
if [[ $code -eq 3 ]]; then
  echo "SKIPPED: Openverse unreachable after retries; nothing verified this run"
  exit 0
fi
[[ $code -eq 0 ]] || exit "$code"
if [[ "${1:-}" == "--record" ]]; then cp output/metrics.json expected/metrics.json; fi
diff -u expected/metrics.json output/metrics.json
echo "OK: openverse-licence-fields"
