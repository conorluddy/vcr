#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
node render.mjs
first=$(shasum -a 256 output/frame-*.svg)
node render.mjs
[[ "$(shasum -a 256 output/frame-*.svg)" == "$first" ]] || { echo "FAIL: frames differ between runs" >&2; exit 1; }
node check.mjs
for i in 0 1 2; do
  resvg --width 260 output/frame-$i.svg output/frame-$i.png
  magick identify -format '%wx%h' output/frame-$i.png | grep -qx '260x260'
done
magick output/frame-0.png output/frame-1.png output/frame-2.png +append output/contact.png
if [[ "${1:-}" == "--record" ]]; then mkdir -p expected; cp output/metrics.json expected/metrics.json; fi
diff -u expected/metrics.json output/metrics.json
echo "OK: svg-path-commander-cubic"
