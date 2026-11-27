#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
node check.mjs >/dev/null
first=$(shasum -a 256 output/metrics.json)
node check.mjs >/dev/null
[[ "$(shasum -a 256 output/metrics.json)" == "$first" ]] || { echo "FAIL: metrics differ between runs" >&2; exit 1; }
node view.mjs
resvg output/view.svg output/view.png
magick identify -format '%wx%h' output/view.png | grep -qx '600x600'
if [[ "${1:-}" == "--record" ]]; then cp output/metrics.json expected/metrics.json; fi
diff -u expected/metrics.json output/metrics.json
echo "OK: manifold-csg-check"
