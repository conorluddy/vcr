#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
node simulate.mjs compat
first=$(shasum -a 256 output/trajectory.json)
node simulate.mjs compat
[[ "$(shasum -a 256 output/trajectory.json)" == "$first" ]] || { echo "FAIL: trajectory differs between processes" >&2; exit 1; }
node simulate.mjs deluxe output/deluxe.json
node check.mjs
mkdir -p expected
if [[ "${1:-}" == "--record" ]]; then cp output/metrics.json expected/metrics.json; fi
diff -u expected/metrics.json output/metrics.json
echo "OK: box2d-fixed-step"
