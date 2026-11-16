#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p output expected
node capture.mjs > output/raw-metrics.json
node check.mjs
magick compare -metric AE output/baseline.png output/effect.png null: 2> output/differing-pixels.txt || true
diff_pixels=$(awk '{print $1}' output/differing-pixels.txt)
awk -v n="$diff_pixels" 'BEGIN { exit !(n >= 500) }'
jq --argjson changed "$diff_pixels" '. + {differing_pixels: $changed}' output/metrics.json > output/summary.json
magick identify -format '%wx%h' output/effect.png | grep -qx '128x128'
if [[ "${1:-}" == "--record" ]]; then cp output/summary.json expected/summary.json; fi
diff -u expected/summary.json output/summary.json
echo "OK: pixijs-filters-pixelate (changed_pixels=$diff_pixels)"
