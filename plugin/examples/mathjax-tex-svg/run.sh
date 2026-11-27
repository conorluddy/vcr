#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
node render.mjs
first=$(shasum -a 256 output/equation.svg)
node render.mjs
[[ "$(shasum -a 256 output/equation.svg)" == "$first" ]] || { echo "FAIL: SVG differs between runs" >&2; exit 1; }
node check.mjs
resvg --width 960 --background white output/equation.svg output/equation.png
magick identify -format '%wx%h' output/equation.png | grep -qx '960x282'
if [[ "${1:-}" == "--record" ]]; then cp output/metrics.json expected/metrics.json; fi
diff -u expected/metrics.json output/metrics.json
echo "OK: mathjax-tex-svg"
