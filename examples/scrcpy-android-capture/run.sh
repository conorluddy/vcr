#!/usr/bin/env bash
# Record 3 s of the Android device named by ANDROID_SERIAL with scrcpy (no window, no playback, no audio), optionally press one D-pad key
# mid-take (only with VCR_SCRCPY_ALLOW_INPUT=1), then check codec, size (against `adb shell wm size`), duration and that two extracted frames are non-blank and differ.
# Fails (never skips) when no device is connected. Without input the two frames may not differ on a static screen.
set -euo pipefail
cd "$(dirname "$0")"
OUTPUT_DIRECTORY=output
RECORD_FLAG=""
[[ "${1:-}" == "--record" ]] && RECORD_FLAG="--record"
mkdir -p "$OUTPUT_DIRECTORY"

# Never pick up a device on its own: the person names the device to record, and opts in before any key is sent to it.
if [[ -z "${ANDROID_SERIAL:-}" ]]; then
  echo "scrcpy-android-capture: set ANDROID_SERIAL to the device or emulator to record (see 'adb devices'). It is never chosen automatically." >&2
  exit 1
fi
adb -s "$ANDROID_SERIAL" get-state >/dev/null 2>&1 || { echo "scrcpy-android-capture: ANDROID_SERIAL=$ANDROID_SERIAL is not connected (adb devices)." >&2; exit 1; }
send_key() { if [[ "${VCR_SCRCPY_ALLOW_INPUT:-}" == "1" ]]; then adb shell input keyevent "$1"; fi; }

# scrcpy 5.0.1 with --no-window --no-playback segfaulted on startup in roughly 2 of 10 runs here, so allow up to 3 attempts and report each failure.
for ATTEMPT in 1 2 3; do
  send_key KEYCODE_HOME
  sleep 1
  scrcpy --no-playback --no-window --no-audio --record="$OUTPUT_DIRECTORY/take.mp4" --time-limit=3 > "$OUTPUT_DIRECTORY/scrcpy.log" 2>&1 &
  RECORDING_PID=$!
  sleep 1.5
  send_key KEYCODE_DPAD_RIGHT
  if wait "$RECORDING_PID"; then
    break
  fi
  echo "scrcpy-android-capture: KNOWN FLAKE attempt $ATTEMPT: scrcpy exited non-zero (log: $OUTPUT_DIRECTORY/scrcpy.log)" >&2
  [[ "$ATTEMPT" == "3" ]] && { cat "$OUTPUT_DIRECTORY/scrcpy.log" >&2; exit 1; }
done

adb shell wm size > "$OUTPUT_DIRECTORY/wm-size.txt"
ffprobe -v error -select_streams v:0 -show_entries stream=codec_name,width,height -show_entries format=duration,format_name -of json "$OUTPUT_DIRECTORY/take.mp4" > "$OUTPUT_DIRECTORY/ffprobe.json"
ffmpeg -y -loglevel error -ss 0.2 -i "$OUTPUT_DIRECTORY/take.mp4" -frames:v 1 "$OUTPUT_DIRECTORY/frame-early.png"
ffmpeg -y -loglevel error -sseof -0.1 -i "$OUTPUT_DIRECTORY/take.mp4" -update 1 -frames:v 1 "$OUTPUT_DIRECTORY/frame-late.png"
node check.mjs $RECORD_FLAG
echo "scrcpy-android-capture: OK"
