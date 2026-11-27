#!/usr/bin/env bash
# Render a self-authored GeoJSON with an XML style through the Mapnik PyPI wheel (macOS arm64, CPython 3.12) in a venv under
# output/. Checks: three 512x512 PNG frames (ImageMagick), predeclared pixel probes, alpha 255 everywhere, a text label draws
# black pixels, three distinct frames, shuffled order equals sequential, and a second process gives identical PNGs.
# --record rewrites expected/render.json. Needs python3.12 and magick on PATH.
set -euo pipefail
cd "$(dirname "$0")"
name=mapnik-geojson-style

command -v python3.12 >/dev/null || { echo "$name: needs python3.12 on PATH" >&2; exit 1; }
mkdir -p output
[[ -x output/venv/bin/python ]] || { python3.12 -m venv output/venv; output/venv/bin/pip install -q --disable-pip-version-check -r requirements.txt; }
py=output/venv/bin/python

"$py" -I render.py output/run-1 > output/run-1.log 2>&1 || { cat output/run-1.log >&2; exit 1; }
"$py" -I render.py output/run-2 > output/run-2.log 2>&1 || { cat output/run-2.log >&2; exit 1; }
for i in 0 1 2; do
  cmp -s output/run-1/frame-$i.png output/run-2/frame-$i.png || { echo "$name: frame $i differs between two processes" >&2; exit 1; }
  size="$(magick identify -format '%w %h' output/run-1/frame-$i.png)"
  [[ "$size" == "512 512" ]] || { echo "$name: frame $i is '$size', expected '512 512'" >&2; exit 1; }
  amin="$(magick output/run-1/frame-$i.png -alpha extract -format '%[fx:round(255*minima)]' info:)"
  [[ "$amin" == 255 ]] || { echo "$name: frame $i alpha minimum $amin, expected 255" >&2; exit 1; }
done
[[ "$(jq -r .shuffledEqualsSequential output/run-1/render.json)" == true ]] || { echo "$name: shuffled order differs from sequential" >&2; exit 1; }
[[ "$(jq -r .distinctFrameHashes output/run-1/render.json)" == 3 ]] || { echo "$name: frames are not three distinct images" >&2; exit 1; }

probe_failures=0
probe_count=0
while read -r frame label x y r g b; do
  [[ "$frame" == \#* ]] && continue
  probe_count=$((probe_count + 1))
  got="$(magick output/run-1/frame-$frame.png -crop 1x1+"$x"+"$y" +repage -format '%[fx:round(255*r)] %[fx:round(255*g)] %[fx:round(255*b)]' info:)"
  [[ "$got" == "$r $g $b" ]] || { echo "$name: probe $label (frame $frame, $x,$y) is '$got', expected '$r $g $b'" >&2; probe_failures=$((probe_failures + 1)); }
done < probes.tsv
[[ "$probe_count" -eq 7 ]] || { echo "$name: expected 7 probes, read $probe_count" >&2; exit 1; }
[[ "$probe_failures" -eq 0 ]] || exit 1

# Label "Dublin" is centred on lon 4, lat 6 = pixel (256, 128); count near-black pixels in a 160x60 box around it.
dark="$(magick output/run-1/frame-0.png -crop 160x60+176+98 +repage -fuzz 10% -fill white +opaque black -format '%[fx:round(w*h*(1-mean))]' info:)"
[[ "$dark" -gt 100 ]] || { echo "$name: label region has $dark black pixels, expected > 100" >&2; exit 1; }

if [[ "${1:-}" == "--record" ]]; then
  jq -S 'del(.versions)' output/run-1/render.json > expected/render.json
  echo "recorded expected/render.json"
  exit 0
fi
diff <(jq -S 'del(.versions)' expected/render.json) <(jq -S 'del(.versions)' output/run-1/render.json) \
  || { echo "$name: output/run-1/render.json differs from expected/render.json" >&2; exit 1; }
echo "$name: OK (mapnik $(jq -r .versions.mapnik output/run-1/render.json), 3 frames 512x512, $probe_count probes exact, shuffled equals sequential, label black pixels $dark)"
