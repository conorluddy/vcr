#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p output
pnpm -s capture > output/capture.log 2>&1 || { cat output/capture.log >&2; exit 1; }
frame=output/frames/frame-0045.png
magick $frame -crop 640x720+0+0 +repage output/left.png
magick $frame -crop 640x720+640+0 +repage output/right.png
raw=$(magick output/left.png -format %k info:)
smaa=$(magick output/right.png -format %k info:)
alpha_min=$(magick $frame -alpha extract -format "%[fx:minima]" info:)
jq -n --argjson raw "$raw" --argjson smaa "$smaa" --argjson a "$alpha_min" --slurpfile r output/report.json \
  '{frames:$r[0].frames,width:$r[0].width,height:$r[0].height,shuffled_matches_sequential:$r[0].shuffled_matches_sequential,frame_45_aliased_half_colours:$raw,frame_45_smaa_half_colours:$smaa,frame_45_alpha_min:$a,smaa_adds_edge_colours:($smaa>$raw*4)}' > output/summary.json
jq -e '.frames==90 and .width==1280 and .height==720 and .shuffled_matches_sequential==true and .frame_45_alpha_min==1 and .smaa_adds_edge_colours==true' output/summary.json >/dev/null
if [[ "${1:-}" == "--record" ]]; then mkdir -p expected; cp output/summary.json expected/; echo "recorded expected/"; exit 0; fi
diff expected/summary.json output/summary.json && echo "glsl-smaa-capture: OK"
