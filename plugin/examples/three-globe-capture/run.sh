#!/usr/bin/env bash
# three-globe scene (five points and one arc on a globe) rendered once per seek; predeclared checks, then a diff against expected/.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p output
pnpm -s capture > /dev/null
pnpm -s exec tsx probe.ts > output/probe.json
jq -n --slurpfile report output/report.json '{frames: $report[0].frames, width: $report[0].width, height: $report[0].height, shuffled_matches_sequential: $report[0].shuffled_matches_sequential}' > output/summary.json

distinct_hashes=$(jq '.hashes | unique | length' output/report.json)
distinct_ok=$([[ "$distinct_hashes" -ge 2 ]] && echo true || echo false)

alpha_range=$(magick output/frames/frame-0030.png -alpha extract -format "%[fx:minima] %[fx:maxima]" info:)

: > output/measurements.txt
corners_ok=true
for geometry in 200x200+0+0 200x200+1080+0 200x200+0+520 200x200+1080+520; do
  corner_mean=$(magick output/frames/frame-0030.png -crop "$geometry" +repage -alpha extract -format "%[fx:mean]" info:)
  echo "corner $geometry alpha mean $corner_mean" >> output/measurements.txt
  if ! awk -v mean="$corner_mean" 'BEGIN { exit !(mean == 0) }'; then corners_ok=false; fi
done

presence_ok=true
for frameNumber in 0000 0030 0060; do
  presence_count=$(magick "output/frames/frame-$frameNumber.png" -crop 960x540+160+90 +repage -fx "(r>0.6)*(g<0.55)*(b<0.35)" -format "%[fx:mean]" info: | awk '{ printf "%d", $1 * 518400 + 0.5 }')
  echo "frame $frameNumber arc-or-point pixels in central crop: $presence_count" >> output/measurements.txt
  if [[ "$presence_count" -lt 150 ]]; then presence_ok=false; fi
done

echo "distinct hashes: $distinct_hashes" >> output/measurements.txt
echo "frame 0030 alpha min max: $alpha_range" >> output/measurements.txt
echo "renderer: $(jq -r .renderer output/probe.json)" >> output/measurements.txt

jq --arg alphaRange "$alpha_range" --argjson distinctOk "$distinct_ok" --argjson cornersOk "$corners_ok" --argjson presenceOk "$presence_ok" \
  '. + {distinct_hashes_at_least_two: $distinctOk, frame_0030_alpha_range: $alphaRange, corners_transparent: $cornersOk, central_crop_arc_or_point_present: $presenceOk}' \
  output/summary.json > output/summary.tmp && mv output/summary.tmp output/summary.json

if [[ "${1:-}" == "--record" ]]; then mkdir -p expected && cp output/summary.json expected/; echo "recorded expected/"; exit 0; fi
diff expected/summary.json output/summary.json && echo "three-globe-capture: OK ($(jq -r .frames_per_second output/report.json) fps, $distinct_hashes distinct hashes)"
