#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
node render.mjs
cp output/frames.json output/frames-first.json
node render.mjs
cmp output/frames.json output/frames-first.json || { echo "FAIL: frames differ between processes" >&2; exit 1; }
node check.mjs
for p in 0 0.25 0.5 0.75 1; do resvg --width 240 --background white output/frame-$p.svg output/frame-$p.png; done
magick output/frame-0.png output/frame-0.25.png output/frame-0.5.png output/frame-0.75.png output/frame-1.png +append output/contact.png
magick identify -format '%wx%h' output/contact.png | grep -qx '1200x240'
if [[ "${1:-}" == "--record" ]]; then cp output/metrics.json expected/metrics.json; fi
diff -u expected/metrics.json output/metrics.json
echo "OK: morphicons-icon-morph"
