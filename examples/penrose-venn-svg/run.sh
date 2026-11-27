#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
node render.mjs
first=$(shasum -a 256 output/venn.svg)
node render.mjs
[[ "$(shasum -a 256 output/venn.svg)" == "$first" ]] || { echo "FAIL: fixed variation gave different SVG bytes" >&2; exit 1; }
VARIATION=VcrOtherVariation2 OUTPUT=output/venn-other.svg node render.mjs
node check.mjs
resvg --width 800 --background white output/venn.svg output/venn.png
magick identify -format '%wx%h' output/venn.png | grep -qx '800x600'
if [[ "${1:-}" == "--record" ]]; then mkdir -p expected && cp output/metrics.json expected/metrics.json; fi
diff -u expected/metrics.json output/metrics.json
echo "OK: penrose-venn-svg"
