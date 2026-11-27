#!/usr/bin/env bash
# three.quarks fountain re-simulated from t=0 on every seek, captured frame by frame with alpha, then checked against predeclared facts.
set -euo pipefail
cd "$(dirname "$0")"
pnpm -s capture > /dev/null
jq '{frames, width, height, shuffled_matches_sequential, distinct_hashes: ([.hashes[]] | unique | length)}' output/report.json > output/summary.json
read -r alphaMin alphaMax <<< "$(magick output/frames/frame-0045.png -alpha extract -format "%[fx:minima] %[fx:maxima]" info:)"
jq --argjson min "$alphaMin" --argjson max "$alphaMax" '. + {alpha_frame_45: {min: (($min * 1000 | round) / 1000), max: (($max * 1000 | round) / 1000)}}' output/summary.json > output/summary.tmp && mv output/summary.tmp output/summary.json
echo "alpha frame 45 min=$alphaMin max=$alphaMax"
if [[ "${1:-}" == "--record" ]]; then mkdir -p expected; cp output/summary.json expected/; echo "recorded expected/"; exit 0; fi
diff expected/summary.json output/summary.json
jq -e '.frames == 90 and .width == 640 and .height == 360 and .shuffled_matches_sequential == true and .distinct_hashes == 90 and .alpha_frame_45.min == 0 and .alpha_frame_45.max > 0' output/summary.json > /dev/null
echo "three-quarks-capture: OK ($(jq -r .frames_per_second output/report.json) fps, $(jq -r .distinct_hashes output/summary.json) distinct hashes)"
