#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
node render.mjs
cp output/render.json output/render-first.json
node render.mjs
diff -u output/render-first.json output/render.json || { echo "FAIL: output differs between runs" >&2; exit 1; }
node check.mjs
resvg --width 640 --background white output/frame-1.0.svg output/frame-1.0-svg.png
magick identify -format '%wx%h' output/frame-1.0-svg.png | grep -qx '640x360'
if [[ "${1:-}" == "--record" ]]; then mkdir -p expected && cp output/metrics.json expected/metrics.json; fi
diff -u expected/metrics.json output/metrics.json
echo "OK: skia-canvas-frames"
