#!/usr/bin/env bash
# Encode a 48-frame 10-bit HEVC test stream with x265, inject a hand-written Dolby Vision RPU (dovi_tool) and a
# hand-written HDR10+ JSON (hdr10plus_tool) into separate copies, read both back and check against inputs/ and
# expected/. Output is ignored; only inputs and expected facts are retained. Every check prints PASS or FAIL.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p output
FAILURES=0

report() { # report <PASS|FAIL> <check name> <detail>
  echo "$1 $2: $3"
  if [[ "$1" != PASS ]]; then FAILURES=$((FAILURES + 1)); fi
}

# === GENERATE AND INJECT ===
ffmpeg -y -loglevel error -f lavfi -i testsrc2=size=640x360:rate=24 -frames:v 48 -pix_fmt yuv420p10le \
  -c:v libx265 -preset medium -crf 20 \
  -x265-params "colorprim=bt2020:transfer=smpte2084:colormatrix=bt2020nc:range=limited:repeat-headers=1:log-level=error" \
  -f hevc output/base.hevc
dovi_tool generate -j inputs/dv-config.json -p 8.1 -o output/rpu.bin > output/dovi-generate.log 2>&1
dovi_tool inject-rpu -i output/base.hevc -r output/rpu.bin -o output/dv.hevc > output/dovi-inject.log 2>&1
hdr10plus_tool inject -i output/base.hevc -j inputs/hdr10plus.json -o output/hdr10plus.hevc > output/hdr10plus-inject.log 2>&1

# === READ BACK ===
dovi_tool extract-rpu -i output/dv.hevc -o output/rpu-extracted.bin > output/dovi-extract.log 2>&1
dovi_tool info -s -i output/rpu-extracted.bin > output/dv-summary.txt 2>&1
for frame in $(seq 0 47); do
  dovi_tool info -i output/rpu-extracted.bin -f "$frame" 2>/dev/null | tail -n +2 \
    | jq -c --argjson frame "$frame" '{frame: $frame} + (.vdr_dm_data | .. | objects | select(has("Level1")) | .Level1)'
done | jq -s '.' > output/dv-l1-per-frame.json
hdr10plus_tool extract -i output/hdr10plus.hevc -o output/hdr10plus-extracted.json > output/hdr10plus-extract.log 2>&1

for stream in base dv hdr10plus; do
  ffprobe -v error -count_frames -select_streams v:0 \
    -show_entries stream=codec_name,width,height,pix_fmt,color_primaries,color_transfer,color_space,nb_read_frames \
    -of json "output/$stream.hevc" > "output/$stream-ffprobe.json"
  ffmpeg -loglevel error -i "output/$stream.hevc" -f rawvideo -pix_fmt yuv420p10le - | shasum -a 256 | cut -d' ' -f1 > "output/$stream-pixels.sha256"
done
shasum -a 256 output/rpu.bin output/rpu-extracted.bin output/base.hevc output/dv.hevc output/hdr10plus.hevc > output/generated.sha256

if [[ "${1:-}" == "--record" ]]; then
  cp output/generated.sha256 expected/generated.sha256
  echo "recorded expected/generated.sha256 (hashes only; the checks are predeclared and not recorded)"
  exit 0
fi

# === CHECKS (predeclared in README, not changed after a run) ===
for stream in base dv hdr10plus; do
  if diff <(jq -S . expected/base-ffprobe.json) <(jq -S '.streams[0]' "output/$stream-ffprobe.json") > /dev/null; then
    report PASS "stream facts $stream" "matches expected/base-ffprobe.json"
  else
    report FAIL "stream facts $stream" "differs from expected/base-ffprobe.json"
  fi
done

BASE_PIXELS=$(cat output/base-pixels.sha256)
for stream in dv hdr10plus; do
  if [[ "$(cat "output/$stream-pixels.sha256")" == "$BASE_PIXELS" ]]; then
    report PASS "pixel identity $stream" "decoded raw frames equal base"
  else
    report FAIL "pixel identity $stream" "decoded raw frames differ from base"
  fi
done

PROFILE_READ=$(sed -n 's/^  Profile: //p' output/dv-summary.txt)
PROFILE_EXPECTED=$(jq -r .profile expected/dv-summary.json)
if [[ "$PROFILE_READ" == "$PROFILE_EXPECTED" ]]; then
  report PASS "dolby vision profile" "read $PROFILE_READ"
else
  report FAIL "dolby vision profile" "read $PROFILE_READ, predeclared $PROFILE_EXPECTED"
fi

FRAMES_READ=$(sed -n 's/^  Frames: //p' output/dv-summary.txt)
FRAMES_EXPECTED=$(jq -r .frames expected/dv-summary.json)
if [[ "$FRAMES_READ" == "$FRAMES_EXPECTED" ]]; then
  report PASS "dolby vision frame count" "read $FRAMES_READ"
else
  report FAIL "dolby vision frame count" "read $FRAMES_READ, predeclared $FRAMES_EXPECTED"
fi

if diff <(jq -S . expected/dv-l1-per-frame.json) <(jq -S . output/dv-l1-per-frame.json) > output/dv-l1-diff.txt; then
  report PASS "per-frame L1" "48 frames match expected/dv-l1-per-frame.json"
else
  report FAIL "per-frame L1" "differs from expected/dv-l1-per-frame.json (see output/dv-l1-diff.txt)"
fi

if jq -e '[.[].max_pq] | unique | length >= 3' output/dv-l1-per-frame.json > /dev/null; then
  report PASS "L1 not constant" "at least three distinct max_pq values"
else
  report FAIL "L1 not constant" "fewer than three distinct max_pq values"
fi

if cmp -s output/rpu.bin output/rpu-extracted.bin; then
  report PASS "rpu byte identity" "extract-rpu output equals generated rpu.bin"
else
  report FAIL "rpu byte identity" "extract-rpu output differs from generated rpu.bin"
fi

HDR10PLUS_INPUT_JSON='[.SceneInfo[] | {AverageRGB: .LuminanceParameters.AverageRGB, MaxScl: .LuminanceParameters.MaxScl, DistributionValues: .LuminanceParameters.LuminanceDistributions.DistributionValues}]'
if diff <(jq -c "$HDR10PLUS_INPUT_JSON" inputs/hdr10plus.json) <(jq -c "$HDR10PLUS_INPUT_JSON" output/hdr10plus-extracted.json) > /dev/null; then
  report PASS "hdr10+ read back" "48 frames match inputs/hdr10plus.json (AverageRGB, MaxScl, DistributionValues)"
else
  report FAIL "hdr10+ read back" "extracted frames differ from inputs/hdr10plus.json"
fi

RECORDED_HASHES=$(cat expected/generated.sha256 2>/dev/null || echo "none")
if [[ "$(cat output/generated.sha256)" == "$RECORDED_HASHES" ]]; then
  echo "info: generated byte streams identical to recorded hashes (not gated)"
else
  echo "info: generated byte streams differ from recorded hashes (not gated)"
fi

if (( FAILURES > 0 )); then
  echo "dovi-tool-metadata-roundtrip: FAIL ($FAILURES checks failed)"
  exit 1
fi
echo "dovi-tool-metadata-roundtrip: OK"
