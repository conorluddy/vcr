#!/usr/bin/env bash
# Render an inline offline style with the prebuilt @maplibre/maplibre-gl-native binding at pixel ratios 1 and 2, then
# check: two separate runs give byte-identical RGBA buffers; each buffer has the predeclared size; ImageMagick reads the
# predeclared probes from the raw buffers; output/render.json (without versions) equals expected/render.json.
# --record rewrites expected/render.json.
set -euo pipefail
cd "$(dirname "$0")"
EXAMPLE=maplibre-native-offline-render

abi="$(node -p process.versions.modules)"
[[ -f "node_modules/@maplibre/maplibre-gl-native/lib/node-v$abi/mbgl.node" ]] \
  || { echo "$EXAMPLE: no prebuilt binding for node $(node -v) (ABI $abi); see README 'Plan' for the install step" >&2; exit 1; }

mkdir -p output
pnpm -s render > output/run-1.log 2>&1 || { cat output/run-1.log >&2; exit 1; }
cp output/map-ratio1.rgba output/run-1-ratio1.rgba
cp output/map-ratio2.rgba output/run-1-ratio2.rgba
pnpm -s render > output/run-2.log 2>&1 || { cat output/run-2.log >&2; exit 1; }
cmp -s output/run-1-ratio1.rgba output/map-ratio1.rgba || { echo "$EXAMPLE: rerun buffers differ at pixel ratio 1" >&2; exit 1; }
cmp -s output/run-1-ratio2.rgba output/map-ratio2.rgba || { echo "$EXAMPLE: rerun buffers differ at pixel ratio 2" >&2; exit 1; }

probe_failures=0
probe_count=0
while IFS=$'\t' read -r file width height name x y red green blue; do
  probe_count=$((probe_count + 1))
  got="$(magick -size "${width}x${height}" -depth 8 "rgba:output/$file" -crop 1x1+"$x"+"$y" +repage -format '%[fx:round(255*r)] %[fx:round(255*g)] %[fx:round(255*b)] %[fx:round(255*a)]' info:)"
  want="$red $green $blue 255"
  if [[ "$got" != "$want" ]]; then
    echo "$EXAMPLE: $file probe $name at ($x, $y) is '$got', expected '$want'" >&2
    probe_failures=$((probe_failures + 1))
  fi
done < <(jq -r '.renders[] as $render | $render.probes[] | [$render.file, $render.width, $render.height, .name, .x, .y, .expectedRgb[0], .expectedRgb[1], .expectedRgb[2]] | @tsv' output/render.json)
[[ "$probe_count" -eq 10 ]] || { echo "$EXAMPLE: expected 10 probes (5 per pixel ratio), read $probe_count" >&2; exit 1; }
[[ "$probe_failures" -eq 0 ]] || exit 1

if [[ "${1:-}" == "--record" ]]; then
  jq -S 'del(.versions)' output/render.json > expected/render.json
  echo "recorded expected/render.json"
  exit 0
fi

diff <(jq -S 'del(.versions)' expected/render.json) <(jq -S 'del(.versions)' output/render.json) \
  || { echo "$EXAMPLE: output/render.json differs from expected/render.json" >&2; exit 1; }

echo "$EXAMPLE: OK (maplibre-gl-native $(jq -r .versions.maplibreGlNative output/render.json), node $(jq -r .versions.node output/render.json), ABI $abi, $(jq -r '[.renders[] | "\(.width)x\(.height)"] | join(" and ")' output/render.json) RGBA, $probe_count probes exact, alpha 255..255, requests $(jq -r .requestsAttempted output/render.json), sha256 ratio1 $(jq -r '.renders[0].sha256' output/render.json), ratio2 $(jq -r '.renders[1].sha256' output/render.json))"
