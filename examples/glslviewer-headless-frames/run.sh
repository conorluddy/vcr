#!/usr/bin/env bash
# Render shader.frag headlessly with glslViewer's sequence export, then check the predeclared facts in README.md:
# frame count, dimensions, distinct frames, re-render identity, sub-range equality, pixel probes and alpha.
# --record writes expected/summary.json only when every check passes; a plain run diffs against it.
set -euo pipefail
cd "$(dirname "$0")"
example_dir="$PWD"
shader="$example_dir/shader.frag"
frames_per_second=8
full_frame_count=8
range_frame_count=4
expected_width=128
expected_height=96
colour_tolerance=2
probe_frame_indices=(0 2 4 7)
probe_positions=("0 0" "127 0" "64 48" "127 95")
middle_frame_index=4
max_wait_polls=240

rm -rf output
mkdir -p output/full output/again output/range

# Prints the path of 0-based frame $2 in directory $1, using glslViewer's zero-padded numbering.
frame_path() { printf '%s/%05d.png' "$1" "$2"; }

# Prints the number of PNG frames in directory $1.
count_frames() { find "$1" -maxdepth 1 -name '*.png' | wc -l | tr -d ' '; }

# Renders shader.frag into directory $1 with sequence export from $2 to $3 seconds, waiting for $4 frames.
# glslViewer keeps running after its startup commands, so it is stopped by PID once the frames exist.
render_sequence() {
  local outputDir="$1" fromSeconds="$2" toSeconds="$3" expectedCount="$4"
  local pid state polls=0 status
  ( cd "$outputDir" && exec glslViewer "$shader" --headless --noncurses --verbose -w 64 -h 48 \
      -e "sequence,$fromSeconds,$toSeconds,$frames_per_second" </dev/null >glslviewer.log 2>&1 ) &
  pid=$!
  while (( $(count_frames "$outputDir") < expectedCount )); do
    state=$(ps -o stat= -p "$pid" 2>/dev/null || true)
    if [[ -z "$state" || "$state" == Z* ]]; then
      status=0
      wait "$pid" 2>/dev/null || status=$?
      echo "FAIL: glslViewer exited with status $status before $expectedCount frames in $outputDir (log: $outputDir/glslviewer.log)" >&2
      exit 1
    fi
    polls=$((polls + 1))
    if (( polls > max_wait_polls )); then
      kill "$pid" 2>/dev/null || true
      echo "FAIL: waited 60 s for $expectedCount frames in $outputDir (log: $outputDir/glslviewer.log)" >&2
      exit 1
    fi
    sleep 0.25
  done
  sleep 1
  kill "$pid" 2>/dev/null || true
  wait "$pid" 2>/dev/null || true
}

# Prints the SHA-256 of the raw 8-bit RGBA pixels of PNG $1, independent of PNG encoding.
pixel_hash() { magick "$1" -depth 8 rgba:- | shasum -a 256 | cut -d' ' -f1; }

# Prints the 8-bit "r,g,b" of the pixel at $2,$3 in PNG $1.
measured_rgb() {
  magick "$1" -depth 8 -crop "1x1+$2+$3" -format "%[fx:round(255*r)],%[fx:round(255*g)],%[fx:round(255*b)]" info:
}

# Prints the analytic 8-bit "r,g,b" at pixel $1,$2 of an expected-size frame at 0-based frame index $3 (t = index / fps).
analytic_rgb() {
  awk -v px="$1" -v py="$2" -v frameNumber="$3" -v w="$expected_width" -v h="$expected_height" -v fps="$frames_per_second" 'BEGIN {
    t = frameNumber / fps
    printf "%d,%d,%d\n", int(255 * (px + 0.5) / w + 0.5), int(255 * (1 - (py + 0.5) / h) + 0.5), int(255 * (0.5 + 0.5 * sin(t)) + 0.5)
  }'
}

# Prints "true" when every channel of measured "r,g,b" is within colour_tolerance of expected "r,g,b".
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

render_sequence output/full 0 1 "$full_frame_count"
render_sequence output/again 0 1 "$full_frame_count"
render_sequence output/range 0.5 1 "$range_frame_count"

full_frames=$(count_frames output/full)
again_frames=$(count_frames output/again)
range_frames=$(count_frames output/range)

dimensions_ok=true
declare -a full_hashes again_hashes range_hashes
for index in $(seq 0 $((full_frame_count - 1))); do
  read -r width height <<< "$(magick identify -format "%w %h" "$(frame_path output/full "$index")")"
  [[ "$width" == "$expected_width" && "$height" == "$expected_height" ]] || dimensions_ok=false
  full_hashes[index]=$(pixel_hash "$(frame_path output/full "$index")")
  again_hashes[index]=$(pixel_hash "$(frame_path output/again "$index")")
done
for index in $(seq 0 $((range_frame_count - 1))); do
  range_hashes[index]=$(pixel_hash "$(frame_path output/range "$index")")
done

distinct_frames=$(printf '%s\n' "${full_hashes[@]}" | sort -u | wc -l | tr -d ' ')

rerun_identical=true
for index in $(seq 0 $((full_frame_count - 1))); do
  [[ "${again_hashes[index]}" == "${full_hashes[index]}" ]] || rerun_identical=false
done

range_matches_full=true
for index in $(seq 0 $((range_frame_count - 1))); do
  [[ "${range_hashes[index]}" == "${full_hashes[index + full_frame_count - range_frame_count]}" ]] || range_matches_full=false
done

probes_checked=0
probes_within_tolerance=true
for index in "${probe_frame_indices[@]}"; do
  for position in "${probe_positions[@]}"; do
    read -r px py <<< "$position"
    measured=$(measured_rgb "$(frame_path output/full "$index")" "$px" "$py")
    expected=$(analytic_rgb "$px" "$py" "$index")
    verdict=$(rgb_within_tolerance "$measured" "$expected")
    [[ "$verdict" == true ]] || probes_within_tolerance=false
    probes_checked=$((probes_checked + 1))
    echo "probe frame=$index pixel=$px,$py measured=$measured expected=$expected within=$verdict"
  done
done

middle="$(frame_path output/full "$middle_frame_index")"
alpha_channels=$(magick identify -format "%[channels]" "$middle" | cut -d' ' -f1)
alpha_range=$(magick "$middle" -alpha extract -depth 8 -format "%[fx:round(255*minima)],%[fx:round(255*maxima)]" info:)
alpha_ok=false
if [[ "$alpha_channels" == srgba && "$alpha_range" == 255,255 ]]; then alpha_ok=true; fi

checks_passed=true
[[ "$full_frames" == "$full_frame_count" ]] || checks_passed=false
[[ "$again_frames" == "$full_frame_count" ]] || checks_passed=false
[[ "$range_frames" == "$range_frame_count" ]] || checks_passed=false
[[ "$dimensions_ok" == true && "$distinct_frames" == "$full_frame_count" ]] || checks_passed=false
[[ "$rerun_identical" == true && "$range_matches_full" == true ]] || checks_passed=false
[[ "$probes_within_tolerance" == true && "$alpha_ok" == true ]] || checks_passed=false

jq -n \
  --argjson frames "$full_frames" \
  --argjson rangeFrames "$range_frames" \
  --argjson width "$expected_width" \
  --argjson height "$expected_height" \
  --argjson dimensionsOk "$dimensions_ok" \
  --argjson distinct "$distinct_frames" \
  --argjson rerunIdentical "$rerun_identical" \
  --argjson rangeMatchesFull "$range_matches_full" \
  --argjson probesChecked "$probes_checked" \
  --argjson probesWithinTolerance "$probes_within_tolerance" \
  --arg alphaChannels "$alpha_channels" \
  --arg alphaRange "$alpha_range" \
  '{
    frames: $frames,
    range_frames: $rangeFrames,
    width: $width,
    height: $height,
    dimensions_ok: $dimensionsOk,
    distinct_frames: $distinct,
    rerun_identical: $rerunIdentical,
    range_0_5_matches_full_4_7: $rangeMatchesFull,
    probes_checked: $probesChecked,
    probes_within_tolerance_per_channel_2: $probesWithinTolerance,
    alpha: {channels: $alphaChannels, middle_frame: 4, min_max_8bit: $alphaRange}
  }' > output/summary.json

echo "renderer: $(grep -m1 -i 'renderer' output/full/glslviewer.log | tr -s ' ' || echo 'not printed')"
if [[ "$checks_passed" != true ]]; then
  cat output/summary.json >&2
  echo "glslviewer-headless-frames: FAIL (a predeclared check did not hold; see output/summary.json)" >&2
  exit 1
fi
if [[ "${1:-}" == "--record" ]]; then
  mkdir -p expected
  cp output/summary.json expected/summary.json
  echo "recorded expected/"
  exit 0
fi
[[ -f expected/summary.json ]] || { echo "no expected/summary.json; run with --record first" >&2; exit 1; }
diff expected/summary.json output/summary.json && echo "glslviewer-headless-frames: OK ($full_frames frames, ${expected_width}x${expected_height}, $probes_checked probes)"
