#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p output
node render.mjs >/dev/null
first=$(shasum -a 256 output/metrics.json)
node render.mjs >/dev/null
[[ "$(shasum -a 256 output/metrics.json)" == "$first" ]] || { echo "FAIL: output differs between runs" >&2; exit 1; }
node check.mjs
if [[ "${1:-}" == "--record" ]]; then cp output/metrics.json expected/metrics.json; fi
diff -u expected/metrics.json output/metrics.json
echo "OK: hyphenopoly-soft-hyphens"
