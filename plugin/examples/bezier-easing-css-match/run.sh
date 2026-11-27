#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
node compare.mjs
resvg --width 660 output/curves.svg output/curves.png
jq 'del(.chromiumVersion)' output/report.json > output/summary.json
if [[ "${1:-}" == "--record" ]]; then cp output/summary.json expected/summary.json; fi
diff -u expected/summary.json output/summary.json
echo "OK: bezier-easing-css-match"
