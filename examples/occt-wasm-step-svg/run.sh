#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
node render.mjs >/dev/null
first=$(shasum -a 256 output/metrics.json output/bracket.stl output/bracket.svg)
node render.mjs >/dev/null
[[ "$(shasum -a 256 output/metrics.json output/bracket.stl output/bracket.svg)" == "$first" ]] || { echo "FAIL: output differs between runs" >&2; exit 1; }
resvg --width 1000 --background white output/bracket.svg output/bracket.png
magick identify -format '%wx%h' output/bracket.png | grep -qx '1000x1046'
if [[ "${1:-}" == "--record" ]]; then mkdir -p expected && cp output/metrics.json expected/metrics.json; fi
diff -u expected/metrics.json output/metrics.json
echo "OK: occt-wasm-step-svg"
