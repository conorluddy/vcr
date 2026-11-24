#!/usr/bin/env bash
# Score a generated reference against itself and against a low-bitrate encode with FFmpeg's libvmaf filter.
# Predeclared checks (see README "Plan, before running") must all pass before the summary is recorded or diffed.
set -euo pipefail
cd "$(dirname "$0")"
FRAME_COUNT=48
VMAF_MODEL="version=vmaf_v0.6.1"
IDENTICAL_CEILING=99.0
DEGRADED_BOUND=80.0
mkdir -p output expected

ffmpeg -y -loglevel error -f lavfi -i "testsrc2=size=320x180:rate=24:duration=2" \
  -c:v libx264 -crf 0 -pix_fmt yuv420p output/reference.mp4
# Single-threaded: multi-threaded x264 at this bitrate decoded to different frames on each run (see README amendment).
ffmpeg -y -loglevel error -i output/reference.mp4 -threads 1 \
  -c:v libx264 -b:v 60k -maxrate 60k -bufsize 60k -pix_fmt yuv420p \
  -x264-params threads=1:lookahead_threads=1:sliced_threads=0 output/degraded.mp4

# $1 distorted clip, $2 log name. The distorted clip is the main input, the reference the second.
score() {
  ffmpeg -hide_banner -loglevel error -i "$1" -i output/reference.mp4 \
    -lavfi "[0:v][1:v]libvmaf=model=$VMAF_MODEL:pool=mean:log_fmt=json:log_path=output/$2.json" -f null -
}
score output/reference.mp4 identical-a
score output/reference.mp4 identical-b
score output/degraded.mp4 degraded-a
score output/degraded.mp4 degraded-b

pooledMean() { jq -r '.pooled_metrics.vmaf.mean' "$1"; }
frameCount() { jq -r '.frames | length' "$1"; }
# Everything except the wall-clock "fps" field, which differs between runs.
stableContent() { jq -S 'del(.fps)' "$1"; }
isLessThan() { awk -v a="$1" -v b="$2" 'BEGIN { exit !(a < b) }'; }
isAtLeast() { awk -v a="$1" -v b="$2" 'BEGIN { exit !(a >= b) }'; }
roundTo3dp() { awk -v v="$1" 'BEGIN { printf "%.3f", v }'; }

identicalMean=$(pooledMean output/identical-a.json)
degradedMean=$(pooledMean output/degraded-a.json)

framesMatch=false
if [[ "$(frameCount output/identical-a.json)" == "$FRAME_COUNT" && "$(frameCount output/degraded-a.json)" == "$FRAME_COUNT" ]]; then
  framesMatch=true
fi
perFrameScoresPresent=false
if jq -e '.frames | all(.metrics.vmaf != null)' output/identical-a.json >/dev/null \
  && jq -e '.frames | all(.metrics.vmaf != null)' output/degraded-a.json >/dev/null; then
  perFrameScoresPresent=true
fi
identicalAtCeiling=false
if isAtLeast "$identicalMean" "$IDENTICAL_CEILING"; then identicalAtCeiling=true; fi
degradedBelowBound=false
if isLessThan "$degradedMean" "$DEGRADED_BOUND"; then degradedBelowBound=true; fi
identicalAboveDegraded=false
if isLessThan "$degradedMean" "$identicalMean"; then identicalAboveDegraded=true; fi
rerunIdentical=false
if diff -q <(stableContent output/identical-a.json) <(stableContent output/identical-b.json) >/dev/null \
  && diff -q <(stableContent output/degraded-a.json) <(stableContent output/degraded-b.json) >/dev/null; then
  rerunIdentical=true
fi

jq -n -S \
  --argjson identicalFrames "$(frameCount output/identical-a.json)" \
  --argjson degradedFrames "$(frameCount output/degraded-a.json)" \
  --argjson identicalMean "$(roundTo3dp "$identicalMean")" \
  --argjson degradedMean "$(roundTo3dp "$degradedMean")" \
  --argjson rerunIdentical "$rerunIdentical" \
  --argjson framesMatch "$framesMatch" \
  --argjson perFrameScoresPresent "$perFrameScoresPresent" \
  --argjson identicalAtCeiling "$identicalAtCeiling" \
  --argjson degradedBelowBound "$degradedBelowBound" \
  --argjson identicalAboveDegraded "$identicalAboveDegraded" \
  '{
    identical: { frames: $identicalFrames, pooled_vmaf_mean: $identicalMean },
    degraded: { frames: $degradedFrames, pooled_vmaf_mean: $degradedMean },
    rerun_identical: $rerunIdentical,
    checks: {
      frames_match: $framesMatch,
      per_frame_scores_present: $perFrameScoresPresent,
      identical_at_ceiling: $identicalAtCeiling,
      degraded_below_bound: $degradedBelowBound,
      identical_above_degraded: $identicalAboveDegraded
    }
  }' > output/summary.json

if ! jq -e '[.rerun_identical, .checks[]] | all(. == true)' output/summary.json >/dev/null; then
  echo "vmaf-ffmpeg-score: predeclared check failed; see output/summary.json" >&2
  cat output/summary.json >&2
  exit 1
fi

if [[ "${1:-}" == "--record" ]]; then cp output/summary.json expected/summary.json; echo "recorded expected/"; exit 0; fi
diff expected/summary.json output/summary.json && echo "vmaf-ffmpeg-score: OK"
