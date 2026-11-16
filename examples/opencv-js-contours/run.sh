#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
node run.mjs
node check.mjs
magick output/input.pgm output/input.png
magick output/threshold.pgm output/threshold.png
magick identify -format '%wx%h' output/input.png | grep -qx '12x10'
magick identify -format '%wx%h' output/threshold.png | grep -qx '12x10'
mkdir -p expected
if [[ "${1:-}" == "--record" ]]; then cp output/metrics.json expected/metrics.json; fi
diff -u expected/metrics.json output/metrics.json
echo "OK: opencv-js-contours"
