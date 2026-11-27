#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
node render.mjs
first=$(shasum -a 256 output/shapes.svg)
node render.mjs
[[ "$(shasum -a 256 output/shapes.svg)" == "$first" ]] || { echo "FAIL: SVG differs between runs" >&2; exit 1; }
node check.mjs
resvg --width 960 --background white output/shapes.svg output/shapes.png
magick identify -format '%wx%h' output/shapes.png | grep -qx '960x300'
if [[ "${1:-}" == "--record" ]]; then cp output/facts.json expected/facts.json; fi
diff -u expected/facts.json output/facts.json
echo "OK: clipper2-polygon-ops"
