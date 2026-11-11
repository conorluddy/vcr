#!/usr/bin/env bash
# Three.js scene drawn through a postprocessing EffectComposer (RenderPass + merged EffectPass), captured frame by frame.
set -euo pipefail
cd "$(dirname "$0")"
pnpm -s capture > /dev/null
alpha_range=$(magick output/frames/frame-0030.png -alpha extract -format "%[fx:round(minima*255)] %[fx:round(maxima*255)]" info:)
jq -n --slurpfile report output/report.json --arg alphaRange "$alpha_range" '
  $report[0] as $r
  | {
      frames: $r.frames,
      width: $r.width,
      height: $r.height,
      distinct_hashes: ($r.hashes | unique | length),
      shuffled_matches_sequential: $r.shuffled_matches_sequential,
      frame30_alpha_min_max_0_255: ($alphaRange | split(" ") | map(tonumber))
    }' > output/summary.json
jq -e '.frames == 90 and .width == 1280 and .height == 720 and .distinct_hashes >= 2 and .shuffled_matches_sequential == true' output/summary.json > /dev/null \
  || { echo "postprocessing-capture: predeclared check failed"; cat output/summary.json; exit 1; }
if [[ "${1:-}" == "--record" ]]; then cp output/summary.json expected/; echo "recorded expected/"; exit 0; fi
diff expected/summary.json output/summary.json && echo "postprocessing-capture: OK ($(jq -r .frames_per_second output/report.json) fps)"
