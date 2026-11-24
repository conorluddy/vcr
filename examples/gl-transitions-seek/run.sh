#!/usr/bin/env bash
# Render gl-transitions Fade in raw WebGL at progress 0, 0.5 and 1 (frames 0, 30, 60), assert the predeclared
# colours, single-colour frames, frame count, dimensions and alpha channel state, then diff the facts against expected/summary.json.
# --record rewrites expected/ from this run.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p output
pnpm -s capture > output/capture.log 2>&1 || { cat output/capture.log >&2; exit 1; }
frames=output/frames
centre_x=320
centre_y=180
colour_tolerance=2

# Prints the centre pixel as "r,g,b" in 8-bit units.
centre_rgb() {
  magick "$1" -depth 8 -crop "1x1+${centre_x}+${centre_y}" -format "%[fx:round(255*r)],%[fx:round(255*g)],%[fx:round(255*b)]" info:
}
# Prints "true" when every channel of measured "r,g,b" is within the tolerance of expected "r,g,b".
rgb_within_tolerance() {
  local -a measured expected
  IFS=, read -r -a measured <<< "$1"
  IFS=, read -r -a expected <<< "$2"
  for channel in 0 1 2; do
    local delta=$(( measured[channel] - expected[channel] ))
    (( delta < 0 )) && delta=$(( -delta ))
    (( delta <= colour_tolerance )) || { echo false; return; }
  done
  echo true
}
# Prints the number of distinct colours in a frame; 1 means the whole frame is one colour.
unique_colour_count() {
  magick "$1" -depth 8 -format "%k" info:
}

frame_count=$(ls "$frames"/frame-*.png | wc -l | tr -d ' ')
dimensions=$(magick identify -format "%w %h" "$frames/frame-0000.png")
read -r width height <<< "$dimensions"

progress_0=$(centre_rgb "$frames/frame-0000.png")
progress_half=$(centre_rgb "$frames/frame-0030.png")
progress_1=$(centre_rgb "$frames/frame-0060.png")
# The PNG carries no alpha channel (%A is Undefined), so an alpha extract would read a default opaque value.
# The real facts are the channel state and whether every pixel is opaque.
alpha_channel_state=$(magick identify -format "%A" "$frames/frame-0030.png")
frame_30_opaque=$(magick identify -format "%[opaque]" "$frames/frame-0030.png" | tr '[:upper:]' '[:lower:]')

# Predeclared: FROM rgb(200,40,0), TO rgb(0,120,255); Fade is mix(from, to, progress), so progress 0.5 is rgb(100,80,127.5).
summary=$(jq -n \
  --argjson frames "$frame_count" \
  --argjson width "$width" \
  --argjson height "$height" \
  --argjson distinct "$(jq -r '.distinct_hashes' output/report.json)" \
  --argjson shuffled "$(jq -r '.shuffled_matches_sequential' output/report.json)" \
  --argjson p0_ok "$(rgb_within_tolerance "$progress_0" 200,40,0)" \
  --argjson p05_ok "$(rgb_within_tolerance "$progress_half" 100,80,128)" \
  --argjson p1_ok "$(rgb_within_tolerance "$progress_1" 0,120,255)" \
  --argjson p0_unique "$(unique_colour_count "$frames/frame-0000.png")" \
  --argjson p05_unique "$(unique_colour_count "$frames/frame-0030.png")" \
  --argjson p1_unique "$(unique_colour_count "$frames/frame-0060.png")" \
  --arg alpha_channel_state "$alpha_channel_state" \
  --argjson frame_30_opaque "$frame_30_opaque" \
  '{
    capture_mode: "screenshot",
    transition: "Fade",
    frames: $frames,
    width: $width,
    height: $height,
    distinct_hashes_at_least_two: ($distinct >= 2),
    shuffled_matches_sequential: $shuffled,
    colour_within_tolerance: {progress_0: $p0_ok, progress_0_5: $p05_ok, progress_1: $p1_ok},
    colour_tolerance_per_channel: 2,
    single_colour_frames: {progress_0: ($p0_unique == 1), progress_0_5: ($p05_unique == 1), progress_1: ($p1_unique == 1)},
    frame_30_alpha: {channel_state: $alpha_channel_state, opaque: $frame_30_opaque}
  }')
echo "$summary" > output/summary.json

echo "renderer=$(jq -r '.renderer' output/report.json)"
echo "measured centre rgb: progress 0=$progress_0 progress 0.5=$progress_half progress 1=$progress_1"
echo "unique colours per checked frame: $(unique_colour_count "$frames/frame-0000.png") $(unique_colour_count "$frames/frame-0030.png") $(unique_colour_count "$frames/frame-0060.png")"
if [[ "${1:-}" == "--record" ]]; then mkdir -p expected; cp output/summary.json expected/; echo "recorded expected/"; exit 0; fi
diff expected/summary.json output/summary.json && echo "gl-transitions-seek: OK ($(jq -r '.frames' output/report.json) frames, $(jq -r '.renderer' output/report.json))"
