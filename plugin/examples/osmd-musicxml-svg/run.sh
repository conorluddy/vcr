#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
node render.mjs
first=$(shasum -a 256 output/score.svg)
node render.mjs
[[ "$(shasum -a 256 output/score.svg)" == "$first" ]] || { echo "FAIL: SVG differs between runs" >&2; exit 1; }
node check.mjs
resvg --width 1800 --background white output/score.svg output/score.png
magick identify -format '%wx%h' output/score.png | grep -qx '1800x696'
if [[ "${1:-}" == "--record" ]]; then cp output/metrics.json expected/metrics.json; fi
diff -u expected/metrics.json output/metrics.json
echo "OK: osmd-musicxml-svg"
