#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p output
# Live network, structural facts only. An unreachable API fails the run: nothing was verified.
code=0
node check.mjs || code=$?
if [[ $code -eq 3 ]]; then
  echo "FAIL: Openverse unreachable after retries; nothing verified this run (needs network)" >&2
  exit 1
fi
[[ $code -eq 0 ]] || exit "$code"
if [[ "${1:-}" == "--record" ]]; then cp output/metrics.json expected/metrics.json; fi
diff -u expected/metrics.json output/metrics.json
echo "OK: openverse-licence-fields"
