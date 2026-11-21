#!/usr/bin/env bash
# Word-by-word WAAPI text entrance: asserts frame count, dimensions, frame 0 fully transparent, frame 45 partial alpha,
# onset spacing of exactly 3 frames per word, settled last frames, shuffled-equals-sequential. --record rewrites expected/.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p output
pnpm -s capture > output/capture.log 2>&1 || { cat output/capture.log >&2; exit 1; }
pnpm -s probe > output/probe.log 2>&1 || { cat output/probe.log >&2; exit 1; }
alpha() { magick "output/frames/frame-$1.png" -alpha extract -format "%[fx:minima] %[fx:maxima]" info:; }
last_two_equal=$([[ $(jq -r '.hashes[-1]' output/report.json) == $(jq -r '.hashes[-2]' output/report.json) ]] && echo true || echo false)
jq --arg a0 "$(alpha 0000)" --arg a45 "$(alpha 0045)" --argjson settled "$last_two_equal" '
  def range($s): $s | split(" ") | {min: (.[0] | tonumber), max: (.[1] | tonumber)};
  {frames, width, height, shuffled_matches_sequential, frame_0_alpha: range($a0), frame_45_alpha: range($a45), last_two_frames_identical: $settled}' output/report.json > output/summary.json
[[ $(jq .shuffled_matches_sequential output/report.json) == true ]] || { echo "waapi-word-stagger: shuffled order differs at frames $(jq -c .mismatched_frames output/report.json)" >&2; exit 1; }
[[ $(jq .frame_0_alpha.max output/summary.json) == 0 ]] || { echo "waapi-word-stagger: frame 0 not transparent" >&2; exit 1; }
[[ $last_two_equal == true ]] || { echo "waapi-word-stagger: last two frames differ" >&2; exit 1; }
if [[ "${1:-}" == "--record" ]]; then cp output/summary.json output/probe.json expected/; echo "recorded expected/"; exit 0; fi
diff expected/summary.json output/summary.json && diff expected/probe.json output/probe.json && echo "waapi-word-stagger: OK ($(jq -r .frames_per_second output/report.json) fps)"
