#!/usr/bin/env bash
# Canvas 2D count-up (clamped ease-out, digits in fixed cells) captured with alpha; asserts frame count, alpha at frame 45,
# shuffled-equals-sequential and the count-up checks from probe.ts against expected/. --record rewrites expected/.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p output
pnpm -s capture > output/capture.log 2>&1 || { cat output/capture.log >&2; exit 1; }
pnpm -s tsx probe.ts > output/probe.log 2>&1 || { cat output/probe.log >&2; exit 1; }
alpha_range=$(magick output/frames/frame-0045.png -alpha extract -format "%[fx:minima] %[fx:maxima]" info:)
jq --arg alpha "$alpha_range" --slurpfile probe output/probe.json '{frames, width, height, shuffled_matches_sequential,
  frame_45_alpha: ($alpha | split(" ") | {min: (.[0] | tonumber), max: (.[1] | tonumber)}),
  distinct_hashes: (.hashes | unique | length), count_up: $probe[0]}' output/report.json > output/summary.json
[[ $(jq .shuffled_matches_sequential output/report.json) == true ]] || { echo "canvas2d-count-up: shuffled order differs at frames $(jq -c .mismatched_frames output/report.json)" >&2; exit 1; }
if [[ "${1:-}" == "--record" ]]; then cp output/summary.json output/values.json expected/ 2>/dev/null || { mkdir -p expected; cp output/summary.json output/values.json expected/; }; echo "recorded expected/"; exit 0; fi
diff expected/summary.json output/summary.json && diff expected/values.json output/values.json && echo "canvas2d-count-up: OK ($(jq -r .frames_per_second output/report.json) fps)"
