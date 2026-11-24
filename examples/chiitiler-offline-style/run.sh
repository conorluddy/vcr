#!/usr/bin/env bash
# Render an inline offline MapLibre style with chiitiler in Node, then check: PNG is 512x512 (IHDR and
# ImageMagick), five predeclared pixel colours match in the PNG decoded by ImageMagick, two separate
# runs give byte-identical PNGs, and output/render.json (without versions) equals expected/render.json.
# --record rewrites expected/render.json.
set -euo pipefail
cd "$(dirname "$0")"

node -e 'const [major, minor, patch] = process.versions.node.split(".").map(Number); process.exit(major > 24 || (major === 24 && (minor > 22 || (minor === 22 && patch >= 1))) ? 0 : 1)' \
  || { echo "chiitiler-offline-style: needs Node >= 24.22.1, found $(node -v); put a newer node first on PATH" >&2; exit 1; }

mkdir -p output
pnpm -s render > output/run-1.log 2>&1 || { cat output/run-1.log >&2; exit 1; }
cp output/map.png output/run-1.png
pnpm -s render > output/run-2.log 2>&1 || { cat output/run-2.log >&2; exit 1; }
cmp -s output/run-1.png output/map.png || { echo "chiitiler-offline-style: rerun PNGs differ" >&2; exit 1; }

size="$(magick identify -format '%w %h' output/map.png)"
[[ "$size" == "512 512" ]] || { echo "chiitiler-offline-style: ImageMagick reads PNG as '$size', expected '512 512'" >&2; exit 1; }

probe_failures=0
probe_count=0
while read -r name x y red green blue; do
  probe_count=$((probe_count + 1))
  got="$(magick output/map.png -crop 1x1+"$x"+"$y" +repage -format '%[fx:round(255*r)] %[fx:round(255*g)] %[fx:round(255*b)] %[fx:round(255*a)]' info:)"
  want="$red $green $blue 255"
  if [[ "$got" != "$want" ]]; then
    echo "chiitiler-offline-style: probe $name at ($x, $y) is '$got', expected '$want'" >&2
    probe_failures=$((probe_failures + 1))
  fi
done < <(jq -r '.probes[] | "\(.name) \(.x) \(.y) \(.expectedRgb[0]) \(.expectedRgb[1]) \(.expectedRgb[2])"' output/render.json)
[[ "$probe_count" -eq 5 ]] || { echo "chiitiler-offline-style: expected 5 probes, read $probe_count" >&2; exit 1; }
[[ "$probe_failures" -eq 0 ]] || exit 1

if [[ "${1:-}" == "--record" ]]; then
  jq -S 'del(.versions)' output/render.json > expected/render.json
  echo "recorded expected/render.json"
  exit 0
fi

diff <(jq -S 'del(.versions)' expected/render.json) <(jq -S 'del(.versions)' output/render.json) \
  || { echo "chiitiler-offline-style: output/render.json differs from expected/render.json" >&2; exit 1; }

echo "chiitiler-offline-style: OK (chiitiler $(jq -r .versions.chiitiler output/render.json), node $(jq -r .versions.node output/render.json), $size px, $probe_count probes exact, alpha $(jq -r '"\(.alphaRange.min)..\(.alphaRange.max)"' output/render.json), PNG sha256 $(jq -r .png.sha256 output/render.json))"
