#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
node render.mjs
first=$(shasum -a 256 output/layout.json)
node render.mjs
[[ "$(shasum -a 256 output/layout.json)" == "$first" ]] || { echo "FAIL: layout differs between runs" >&2; exit 1; }
node check.mjs
for svg in output/bin-*.svg; do resvg "$svg" "${svg%.svg}.png"; done
magick identify -format '%wx%h' output/bin-0.png | grep -qx '256x256'
if [[ "${1:-}" == "--record" ]]; then cp output/metrics.json expected/metrics.json; fi
diff -u expected/metrics.json output/metrics.json
echo "OK: maxrects-atlas-pack"
