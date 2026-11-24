#!/usr/bin/env bash
# Render a carved 3x3x3 voxel cube to SVG with heerich in Node, check the face and polygon counts against
# predeclared analytic values, require byte-identical SVG across two runs, and diff output/scene.json against
# expected/scene.json. --record rewrites expected/.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p output
pnpm -s render > output/run-1.log 2>&1 || { cat output/run-1.log >&2; exit 1; }
cp output/scene.svg output/run-1.svg
pnpm -s render > output/run-2.log 2>&1 || { cat output/run-2.log >&2; exit 1; }
cmp -s output/run-1.svg output/scene.svg || { echo "heerich-voxel-svg: runs differ" >&2; exit 1; }
if [[ "${1:-}" == "--record" ]]; then cp output/scene.json expected/; echo "recorded expected/"; exit 0; fi
diff expected/scene.json output/scene.json && echo "heerich-voxel-svg: OK (heerich $(jq -r .versions.heerich output/scene.json), node $(jq -r .versions.node output/scene.json), $(jq -r .counts.svgPolygons output/scene.json) polygons, svg sha256 $(jq -r .svg.sha256 output/scene.json))"
