#!/usr/bin/env bash
# Capture a Shiki Magic Move transition frame by frame from seek time, assert the predeclared checks,
# read the middle frame's alpha range, and diff the facts against expected/summary.json.
# --record rewrites expected/ from this run.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p output
pnpm -s capture > output/capture.log 2>&1 || { cat output/capture.log >&2; exit 1; }
alpha_range=$(magick output/frames/frame-0045.png -alpha extract -format "%[fx:minima] %[fx:maxima]" info:)
jq --arg alpha "$alpha_range" '{
  frames: .runs[0].frames, width: .runs[0].width, height: .runs[0].height,
  static_reference_frames: .runs[2].frames, checks,
  middle_frame_alpha: ($alpha | split(" ") | {min: (.[0] | tonumber), max: (.[1] | tonumber)})
}' output/report.json > output/summary.json
if [[ "${1:-}" == "--record" ]]; then mkdir -p expected; cp output/summary.json expected/; echo "recorded expected/"; exit 0; fi
diff expected/summary.json output/summary.json && echo "shiki-magic-move-capture: OK ($(jq -r '.runs[0].frames' output/report.json) frames, $(jq -r '.distinct_hashes' output/report.json) distinct)"
