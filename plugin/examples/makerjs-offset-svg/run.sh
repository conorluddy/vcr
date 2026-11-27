#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
digest() { cat output/plate.svg output/outline.svg output/outline.dxf | shasum -a 256; }
node render.mjs
first=$(digest)
node render.mjs
[[ "$(digest)" == "$first" ]] || { echo "FAIL: output differs between runs" >&2; exit 1; }
node check.mjs
resvg --width 800 --background white output/plate.svg output/plate.png
resvg --width 800 --background white output/outline.svg output/outline.png
[[ "$(magick identify -format '%wx%h' output/plate.png)" == "800x501" ]] || { echo "FAIL: plate PNG size" >&2; exit 1; }
[[ "$(magick identify -format '%wx%h' output/outline.png)" == "800x522" ]] || { echo "FAIL: outline PNG size" >&2; exit 1; }
if [[ "${1:-}" == "--record" ]]; then cp output/metrics.json expected/metrics.json; fi
diff -u expected/metrics.json output/metrics.json
echo "OK: makerjs-offset-svg"
