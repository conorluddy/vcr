#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p output expected
node capture.mjs > output/raw-metrics.json
node check.mjs
magick identify -format '%wx%h' output/frame.png | grep -qx '640x360'
mean=$(magick output/frame.png -format '%[fx:mean]' info:)
awk -v m="$mean" 'BEGIN { exit !(m > 0.02 && m < 0.95) }'
jq '{troika_version,three_version,playwright_version,chromium_version,canvas,sync_complete,text,fontSize,glyphBounds,caretPositions,blockBounds,visibleBounds,browserWebGLRenderer,browserWebGLVendor,unmaskedWebGLRenderer,unmaskedWebGLVendor,maxTextureSize,capture_sha256,repeated_capture_equal}' output/metrics.json > output/summary.json
if [[ "${1:-}" == "--record" ]]; then cp output/summary.json expected/summary.json; fi
diff -u expected/summary.json output/summary.json
echo "OK: troika-three-text-sync"
