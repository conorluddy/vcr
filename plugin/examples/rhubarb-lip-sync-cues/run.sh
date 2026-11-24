#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
RHUBARB="$PWD/output/bin/extracted/Rhubarb-Lip-Sync-1.14.0-macOS/rhubarb"
[[ -x "$RHUBARB" ]] || { echo "Download and extract the Rhubarb 1.14.0 macOS archive into output/bin/extracted as in README.md; no automatic install." >&2; exit 1; }
VOICE="Samantha"
EXTENDED_SHAPES="GHX"

rm -rf output/phrases output/input.wav output/input-ffprobe.json output/reference.json output/dialog.txt output/*.json output/*.log
mkdir -p output/phrases
phraseIndex=0
while IFS= read -r phrase; do
  name=$(printf '%02d' "$phraseIndex")
  say -v "$VOICE" -o "output/phrases/$name.aiff" "$phrase"
  ffmpeg -y -loglevel error -i "output/phrases/$name.aiff" -ar 16000 -ac 1 -c:a pcm_s16le "output/phrases/$name.wav"
  phraseIndex=$((phraseIndex + 1))
done < phrases.txt
python3 -I make_input.py phrases.txt output/phrases output/input.wav output/reference.json output/dialog.txt
ffprobe -v error -show_entries stream=codec_name,sample_rate,channels -show_entries format=duration -of json output/input.wav > output/input-ffprobe.json

rhubarbArgs=(-q -r pocketSphinx --extendedShapes "$EXTENDED_SHAPES" -f json)
"$RHUBARB" "${rhubarbArgs[@]}" -o output/plain-run1.json output/input.wav 2> output/plain-run1.log
"$RHUBARB" "${rhubarbArgs[@]}" -o output/plain-run2.json output/input.wav 2> output/plain-run2.log
"$RHUBARB" "${rhubarbArgs[@]}" -d output/dialog.txt -o output/dialog-run1.json output/input.wav 2> output/dialog-run1.log
"$RHUBARB" "${rhubarbArgs[@]}" -d output/dialog.txt -o output/dialog-run2.json output/input.wav 2> output/dialog-run2.log
python3 -I check.py output

if [[ "${1:-}" == "--record" ]]; then
  cp output/checks.json expected/checks.json
  cp output/normalised-plain.json expected/normalised-plain.json
  cp output/normalised-dialog.json expected/normalised-dialog.json
  echo "recorded expected/"
  exit 0
fi
diff expected/checks.json output/checks.json
diff expected/normalised-plain.json output/normalised-plain.json
diff expected/normalised-dialog.json output/normalised-dialog.json
echo "rhubarb-lip-sync-cues: OK"
