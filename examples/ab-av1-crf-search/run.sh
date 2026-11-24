#!/usr/bin/env bash
# Find a CRF with ab-av1 crf-search for a VMAF target, encode at that CRF, and score the encode with FFmpeg libvmaf.
# Predeclared checks (see README "Plan, before running") must all pass before the summary is recorded or diffed.
set -euo pipefail
cd "$(dirname "$0")"
MIN_VMAF=95
VMAF_TOLERANCE=1.0
PRESET=10
ENCODER=libsvtav1
VMAF_MODEL="version=vmaf_v0.6.1"
FRAME_COUNT=48
mkdir -p output/tmp expected
rm -f output/encoded.mp4 output/full-vmaf.json output/search-*.jsonl

ffmpeg -y -loglevel error -f lavfi -i "testsrc2=size=640x360:rate=24:duration=2" \
  -c:v libx264 -crf 0 -pix_fmt yuv420p output/reference.mp4

# Three independent searches: run 1 is the gated result, runs 2 and 3 test repeatability.
for run in 1 2 3; do
  ab-av1 crf-search -i output/reference.mp4 --encoder "$ENCODER" --preset "$PRESET" \
    --min-vmaf "$MIN_VMAF" --samples 1 --sample-duration 2s --cache false \
    --temp-dir output/tmp --stdout-format json > "output/search-$run.jsonl" 2> "output/search-$run.log"
done

searchDone() { jq -c 'select(.type == "crf-search-done")' "$1" | tail -n 1; }
searchCrf() { searchDone "$1" | jq -r '.crf'; }
searchVmaf() { searchDone "$1" | jq -r '.vmaf'; }
roundTo3dp() { awk -v v="$1" 'BEGIN { printf "%.3f", v }'; }
isAtLeast() { awk -v a="$1" -v b="$2" 'BEGIN { exit !(a >= b) }'; }
frameCount() { ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 "$1"; }

crf=$(searchCrf output/search-1.jsonl)
predictedVmaf=$(searchVmaf output/search-1.jsonl)
crfRun2=$(searchCrf output/search-2.jsonl)
crfRun3=$(searchCrf output/search-3.jsonl)
predictedVmafRun2=$(searchVmaf output/search-2.jsonl)
predictedVmafRun3=$(searchVmaf output/search-3.jsonl)

ab-av1 encode -i output/reference.mp4 --encoder "$ENCODER" --preset "$PRESET" --crf "$crf" -o output/encoded.mp4 > output/encode.log 2>&1

ffmpeg -hide_banner -loglevel error -i output/encoded.mp4 -i output/reference.mp4 \
  -lavfi "[0:v]format=yuv420p[d];[1:v]format=yuv420p[r];[d][r]libvmaf=model=$VMAF_MODEL:pool=mean:log_fmt=json:log_path=output/full-vmaf.json" -f null -

fullMean=$(jq -r '.pooled_metrics.vmaf.mean' output/full-vmaf.json)
fullFrames=$(jq -r '.frames | length' output/full-vmaf.json)
encodedFrames=$(frameCount output/encoded.mp4)
referenceFrames=$(frameCount output/reference.mp4)
referenceSize=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 output/reference.mp4)

crfRepeatsEqual=false
if [[ "$crf" == "$crfRun2" && "$crf" == "$crfRun3" ]]; then crfRepeatsEqual=true; fi
searchMeetsTarget=false
if isAtLeast "$predictedVmaf" "$MIN_VMAF"; then searchMeetsTarget=true; fi
repeatsMeetTarget=false
if isAtLeast "$predictedVmafRun2" "$MIN_VMAF" && isAtLeast "$predictedVmafRun3" "$MIN_VMAF"; then repeatsMeetTarget=true; fi
encodeMeetsTarget=false
if isAtLeast "$fullMean" "$(awk -v a="$MIN_VMAF" -v t="$VMAF_TOLERANCE" 'BEGIN { print a - t }')"; then encodeMeetsTarget=true; fi
framesMatch=false
if [[ "$referenceFrames" == "$FRAME_COUNT" && "$referenceSize" == "640,360" && "$encodedFrames" == "$FRAME_COUNT" && "$fullFrames" == "$FRAME_COUNT" ]]; then
  framesMatch=true
fi

jq -n -S \
  --argjson crf "$crf" \
  --argjson predictedVmaf "$(roundTo3dp "$predictedVmaf")" \
  --argjson crfRun2 "$crfRun2" \
  --argjson crfRun3 "$crfRun3" \
  --argjson crfRepeatsEqual "$crfRepeatsEqual" \
  --argjson encodedFrames "$encodedFrames" \
  --argjson fullVmafMean "$(roundTo3dp "$fullMean")" \
  --argjson searchMeetsTarget "$searchMeetsTarget" \
  --argjson repeatsMeetTarget "$repeatsMeetTarget" \
  --argjson encodeMeetsTarget "$encodeMeetsTarget" \
  --argjson framesMatch "$framesMatch" \
  '{
    search: { min_vmaf: 95, crf: $crf, predicted_vmaf: $predictedVmaf, repeat_crfs: [$crfRun2, $crfRun3] },
    encode: { frames: $encodedFrames, full_vmaf_pooled_mean: $fullVmafMean },
    crf_repeats_equal: $crfRepeatsEqual,
    checks: {
      frames_match: $framesMatch,
      search_meets_target: $searchMeetsTarget,
      repeats_meet_target: $repeatsMeetTarget,
      encode_meets_target_within_tolerance: $encodeMeetsTarget
    }
  }' > output/summary.json

if ! jq -e '[.checks[]] | all(. == true)' output/summary.json >/dev/null; then
  echo "ab-av1-crf-search: predeclared check failed; see output/summary.json" >&2
  cat output/summary.json >&2
  exit 1
fi

if [[ "${1:-}" == "--record" ]]; then cp output/summary.json expected/summary.json; echo "recorded expected/"; exit 0; fi
diff expected/summary.json output/summary.json && echo "ab-av1-crf-search: OK"
