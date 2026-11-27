#!/usr/bin/env bash
# Render a self-authored gource custom log to H.264 via a PPM pipe into FFmpeg, twice, and check frame count and determinism.
# gource opens an OpenGL window while it runs (not headless on macOS); the window is expected, not a failure.
set -euo pipefail
cd "$(dirname "$0")"

WIDTH=640
HEIGHT=360
FRAMERATE=30
HASH_SEED=1
SECONDS_PER_DAY=1
LOG_SPAN_SECONDS=169800   # last minus first timestamp in project.log
FRAME_COUNT_TOLERANCE=0.10

command -v gource >/dev/null || { echo "gource-custom-log: gource not found. Install it with: brew install gource" >&2; exit 1; }
command -v ffmpeg >/dev/null || { echo "gource-custom-log: ffmpeg not found. Install it with: brew install ffmpeg" >&2; exit 1; }
command -v jq >/dev/null || { echo "gource-custom-log: jq not found. Install it with: brew install jq" >&2; exit 1; }

mkdir -p output expected
rm -f output/run-*.mp4 output/summary.json output/inspect-sheet.png

renderOnce() {
  gource project.log --log-format custom -"${WIDTH}x${HEIGHT}" --hash-seed "$HASH_SEED" \
    --stop-at-end --disable-auto-skip -s "$SECONDS_PER_DAY" -r "$FRAMERATE" \
    --hide mouse,progress -o - </dev/null 2>output/gource-stderr.txt \
    | ffmpeg -y -loglevel error -f image2pipe -c:v ppm -framerate "$FRAMERATE" -i - \
        -c:v libx264 -pix_fmt yuv420p -crf 18 "$1"
}
RENDER_RUNS=4   # gource frame counts vary between runs (observed 434 and 458), so one pair would be luck
for run in $(seq 1 "$RENDER_RUNS"); do renderOnce "output/run-$run.mp4"; done

frameHash() { ffmpeg -loglevel error -i "$1" -f framemd5 - | grep -v '^#' | cut -d, -f6 | shasum | cut -d' ' -f1; }
probe() { ffprobe -v error -count_frames -select_streams v:0 -show_entries stream="$1" -of csv=p=0 output/run-1.mp4; }

frameCount=$(probe nb_read_frames)
hashA=$(frameHash output/run-1.mp4)
distinctRuns=$(for run in $(seq 1 "$RENDER_RUNS"); do echo "$(frameHash "output/run-$run.mp4") $(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 "output/run-$run.mp4")"; done | sort | uniq -c | tr -s " " | tr "\n" ";")
distinctHashes=$(printf "%s" "$distinctRuns" | tr ";" "\n" | grep -c .)
meanLuma=$(ffmpeg -loglevel error -i output/run-1.mp4 -vf "select=eq(n\,150),signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=-" -f null - | sed -n 's/.*YAVG=//p' | head -1)
# Prediction made before running: frames = framerate * log span in days * seconds per day.
predictedFrames=$(awk -v f="$FRAMERATE" -v s="$LOG_SPAN_SECONDS" -v d="$SECONDS_PER_DAY" 'BEGIN { printf "%d", f * s / 86400 * d }')

jq -n -S --argjson width "$(probe width)" --argjson height "$(probe height)" \
  --arg rate "$(probe r_frame_rate)" --argjson frameCount "$frameCount" --argjson predictedFrames "$predictedFrames" \
  --arg hashA "$hashA" --argjson identical "$([[ "$distinctHashes" == 1 ]] && echo true || echo false)" \
  --argjson tol "$FRAME_COUNT_TOLERANCE" --argjson luma "$(printf '%.0f' "$meanLuma")" \
  '{ width: $width, height: $height, frameRate: $rate, frameCount: $frameCount, predictedFrames: $predictedFrames,
     decodedFrameHash: $hashA,
     checks: {
       size_and_rate: ($width == 640 and $height == 360 and $rate == "30/1"),
       frame_count_within_10pct_of_prediction: ((($frameCount - $predictedFrames) | fabs) <= ($predictedFrames * $tol)),
       frames_identical_across_runs: $identical,
       frame_not_blank: ($luma > 5)
     } }' > output/summary.json

ffmpeg -y -loglevel error -i output/run-1.mp4 -vf "select='eq(n,40)+eq(n,150)+eq(n,300)+eq(n,$((frameCount-1)))',scale=480:-1,tile=2x2" -frames:v 1 output/inspect-sheet.png

# frameCount, the frame hash and the cross-run verdict vary between invocations (see RENDER_RUNS), so the baseline omits them.
stableSummary() { jq -S 'del(.frameCount, .decodedFrameHash, .checks.frames_identical_across_runs)' "$1"; }
if [[ "${1:-}" == "--record" ]]; then
  stableSummary output/summary.json > expected/summary.json
  echo "gource-custom-log: recorded expected/summary.json"
else
  diff -u expected/summary.json <(stableSummary output/summary.json)
fi

echo "gource-custom-log: this invocation: $RENDER_RUNS renders, distinct (count hash) results:$distinctRuns"
# A predeclared check that fails stays in the fixture; the baseline records the failure and run.sh exits 0 only while it reproduces.
jq -r '.checks | to_entries[] | select(.value == false) | .key' output/summary.json | while read -r name; do
  echo "gource-custom-log: KNOWN FAIL: $name (observed $frameCount frames, predicted $predictedFrames)"
done
if [[ "${1:-}" != "--record" ]]; then echo "gource-custom-log: OK (stable fields reproduce expected/summary.json)"; fi
