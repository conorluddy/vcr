#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
node render.mjs
node check.mjs >/dev/null
resvg output/layout.svg output/layout.png
magick identify -format '%wx%h' output/layout.png | grep -qx '320x180'
if [[ "${1:-}" == "--record" ]]; then cp output/metrics.json expected/metrics.json; fi
diff -u expected/metrics.json output/metrics.json
echo "OK: satori-flex"
