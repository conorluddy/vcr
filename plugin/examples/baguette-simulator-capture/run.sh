#!/usr/bin/env bash
# Boot the predeclared iPhone 17 Pro (EN) simulator with baguette, capture a home-screen PNG and a 3-second recording
# with one home-screen swipe, check dimensions, duration and non-blank frames against expected/capture.json, then shut it down.
# Pixel hashes are not gated: the status-bar clock and simulator rendering are not deterministic.
set -euo pipefail
cd "$(dirname "$0")"
OUTPUT_DIRECTORY=output
DEVICE_UDID=FD84C3BC-FC27-4FEE-BBBD-9955FDA2F45C
RECORD_FLAG=""
if [[ "${1:-}" == "--record" ]]; then
  RECORD_FLAG="--record"
fi
mkdir -p "$OUTPUT_DIRECTORY"

shutdown_simulator() {
  baguette shutdown --udid "$DEVICE_UDID" >/dev/null 2>&1 || true
}
trap shutdown_simulator EXIT

if [[ "$(node check.mjs state)" == "Shutdown" ]]; then
  baguette boot --udid "$DEVICE_UDID"
fi
for _ in $(seq 1 120); do
  if [[ "$(node check.mjs state)" == "Booted" ]]; then
    break
  fi
  sleep 1
done
[[ "$(node check.mjs state)" == "Booted" ]] || { echo "baguette-simulator-capture: device did not reach Booted within 120 s" >&2; exit 1; }

baguette press --udid "$DEVICE_UDID" --button home
baguette screenshot --udid "$DEVICE_UDID" --output "$OUTPUT_DIRECTORY/home.png" --metadata-output "$OUTPUT_DIRECTORY/home-geometry.json"

baguette record --udid "$DEVICE_UDID" --output "$OUTPUT_DIRECTORY/home.mp4" --size native --fps 30 --duration 3 &
RECORDING_PID=$!
sleep 1
baguette swipe --udid "$DEVICE_UDID" --start-x 330 --start-y 437 --end-x 70 --end-y 437 --width 402 --height 874 --duration 0.4
wait "$RECORDING_PID"

ffprobe -v error -select_streams v:0 -show_entries stream=codec_name,width,height -show_entries format=duration,format_name -of json "$OUTPUT_DIRECTORY/home.mp4" > "$OUTPUT_DIRECTORY/ffprobe.json"
ffmpeg -y -loglevel error -ss 0.5 -i "$OUTPUT_DIRECTORY/home.mp4" -frames:v 1 "$OUTPUT_DIRECTORY/frame-early.png"
ffmpeg -y -loglevel error -ss 2.5 -i "$OUTPUT_DIRECTORY/home.mp4" -frames:v 1 "$OUTPUT_DIRECTORY/frame-late.png"

shutdown_simulator
node check.mjs $RECORD_FLAG
echo "baguette-simulator-capture: OK"
