#!/usr/bin/env bash
# Inline SVG paper collage (image + mat + feDropShadow per <g>, paused element.animate seeked via currentTime) captured with alpha.
# Asserts frame count, dimensions, image decode, frame 0 alpha, frame 45 alpha range with soft values, settling and distinct
# final rotations against expected/summary.json. --record rewrites expected/.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p output
pnpm -s capture > output/capture.log 2>&1 || { cat output/capture.log >&2; exit 1; }
f0_max=$(magick output/frames/frame-0000.png -alpha extract -format "%[fx:maxima]" info:)
mid=$(magick output/frames/frame-0045.png -alpha extract -format "%[fx:minima] %[fx:maxima] %k" info:)
jq --arg f0 "$f0_max" --arg mid "$mid" --slurpfile page output/inpage.json '{frames, width, height, shuffled_matches_sequential,
  images: $page[0].images,
  frame_0_alpha_max: ($f0 | tonumber),
  frame_45_alpha: ($mid | split(" ") | {min: (.[0] | tonumber), max: (.[1] | tonumber), has_soft_values: ((.[2] | tonumber) > 2)}),
  last_two_frames_identical: (.hashes[-1] == .hashes[-2]),
  final_rotations_deg: $page[0].rotations,
  final_rotations_all_distinct: (($page[0].rotations | unique | length) == ($page[0].rotations | length))}' output/report.json > output/summary.json
[[ $(jq .shuffled_matches_sequential output/report.json) == true ]] || { echo "svg-paper-collage: shuffled order differs at frames $(jq -c .mismatched_frames output/report.json)" >&2; exit 1; }
jq -e '.images.count == .images.decoded and .images.count >= 5 and .frames == 90 and .width == 1280 and .height == 720 and .last_two_frames_identical and .final_rotations_all_distinct and .frame_45_alpha.has_soft_values and .frame_45_alpha.min == 0 and .frame_45_alpha.max == 1' output/summary.json > /dev/null || { echo "svg-paper-collage: predeclared check failed: $(cat output/summary.json)" >&2; exit 1; }
if [[ "${1:-}" == "--record" ]]; then cp output/summary.json expected/; echo "recorded expected/"; exit 0; fi
diff expected/summary.json output/summary.json && echo "svg-paper-collage: OK ($(jq -r .frames_per_second output/report.json) fps)"
