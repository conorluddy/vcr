#!/usr/bin/env bash
# Render three frames of an isometric scene to static SVG in Node, require identical bytes across two
# processes and shuffled order, check structure against predeclared values, rasterise with resvg and diff
# output/metrics.json against expected/. --record rewrites expected/.
set -euo pipefail
cd "$(dirname "$0")"
rm -rf output
node render.mjs
cat output/frame-*.svg | shasum -a 256 > output/run-1.sha
node render.mjs
cat output/frame-*.svg | shasum -a 256 | cmp - output/run-1.sha || { echo "FAIL: SVG differs between processes" >&2; exit 1; }
node check.mjs
for t in 0 0.5 1; do
  resvg --width 800 --background white "output/frame-$t.svg" "output/frame-$t.png"
  magick identify -format '%wx%h' "output/frame-$t.png" | grep -qx '800x600'
done
magick output/frame-0.png output/frame-0.5.png output/frame-1.png +append -resize 1500x output/contact-sheet.png
if [[ "${1:-}" == "--record" ]]; then cp output/metrics.json expected/metrics.json; fi
diff -u expected/metrics.json output/metrics.json
echo "OK: isometric-svg-scene"
