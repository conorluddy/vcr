#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
hash_outputs() { shasum -a 256 output/*.svg output/credits.json; }
node render.mjs
first=$(hash_outputs)
node render.mjs
[[ "$(hash_outputs)" == "$first" ]] || { echo "FAIL: output differs between runs" >&2; exit 1; }
node check.mjs
for svg in output/*.svg; do
  resvg --height 192 --background white "$svg" "${svg%.svg}.png"
  magick identify -format '%h' "${svg%.svg}.png" | grep -qx '192' || { echo "FAIL: $svg not 192 px tall" >&2; exit 1; }
done
if [[ "${1:-}" == "--record" ]]; then cp output/metrics.json expected/metrics.json; fi
diff -u expected/metrics.json output/metrics.json
echo "OK: iconify-svg-licences"
