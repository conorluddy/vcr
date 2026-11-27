#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
ms=node_modules/.bin/mapshaper
mkdir -p output
$ms -v > output/version.txt 2>&1
# dissolve regions, simplify with a pinned percentage, project to Web Mercator, write GeoJSON then SVG
$ms input.geojson -dissolve region -simplify 50% -proj webmercator -o output/regions.geojson format=geojson
$ms input.geojson -dissolve region -simplify 50% -proj webmercator -style fill='region == "A" ? "#2a6f97" : "#e9c46a"' stroke=#ffffff stroke-width=3 -o output/regions.svg width=800
node check.mjs
resvg --width 800 --background white output/regions.svg output/regions.png
magick identify -format '%w' output/regions.png | grep -qx '800'
if [[ "${1:-}" == "--record" ]]; then mkdir -p expected; cp output/metrics.json expected/metrics.json; fi
diff -u expected/metrics.json output/metrics.json
echo "OK: mapshaper-geojson-svg"
