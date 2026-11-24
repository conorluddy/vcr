#!/usr/bin/env bash
# Generate one sentence with macOS say, transcribe it twice with whisper-cli (ggml-base.en), and
# check the model identity, transcript, JSON/SRT/VTT outputs and rerun determinism against expected/.
set -euo pipefail
cd "$(dirname "$0")"
MODEL="output/models/ggml-base.en.bin"
VOICE="Samantha"
SENTENCE="the red fox jumps over the quiet brown river today"
command -v whisper-cli >/dev/null || { echo "whisper-cli not found: brew install whisper-cpp (README, Dependencies)" >&2; exit 1; }
[[ -f "$MODEL" ]] || { echo "Missing $MODEL: download it as README.md describes; run.sh does not download" >&2; exit 1; }
rm -rf output/input.* output/run1.* output/run2.* output/checks.json output/segments.json output/timing.json
mkdir -p output
say -v "$VOICE" -o output/input.aiff "$SENTENCE"
ffmpeg -y -loglevel error -i output/input.aiff -ar 16000 -ac 1 -c:a pcm_s16le output/input.wav
ffprobe -v error -show_entries stream=codec_name,sample_rate,channels -show_entries format=duration -of json output/input.wav > output/input-ffprobe.json
for run in run1 run2; do
  whisper-cli -m "$MODEL" -f output/input.wav -l en -t 4 -oj -osrt -ovtt -of "output/$run" > "output/$run.log" 2>&1
done
python3 -I check.py output "$MODEL" "$SENTENCE"
if [[ "${1:-}" == "--record" ]]; then
  cp output/checks.json output/segments.json expected/
  echo "recorded expected/"
  exit 0
fi
diff expected/checks.json output/checks.json
diff expected/segments.json output/segments.json
echo "whisper-cpp-transcribe: OK"
