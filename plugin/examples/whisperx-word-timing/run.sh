#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
PYTHON="$PWD/output/venv/bin/python"
[[ -x "$PYTHON" ]] || { echo "Create output/venv with uv and pip install whisperx==3.8.6 as in README.md; no automatic install." >&2; exit 1; }
export HF_HOME="$PWD/output/cache" TORCH_HOME="$PWD/output/cache" XDG_CACHE_HOME="$PWD/output/cache"
VOICE="Samantha"
WORDS=(the red fox jumps over the quiet brown river today)

rm -rf output/words output/input.wav output/*.json output/*.log
mkdir -p output/words
for index in "${!WORDS[@]}"; do
  name=$(printf '%02d' "$index")
  say -v "$VOICE" -o "output/words/$name.aiff" "${WORDS[$index]}"
  ffmpeg -y -loglevel error -i "output/words/$name.aiff" -ar 16000 -ac 1 -c:a pcm_s16le "output/words/$name.wav"
done
"$PYTHON" make_input.py output/words output/input.wav output/reference.json
ffprobe -v error -show_entries stream=codec_name,sample_rate,channels -show_entries format=duration -of json output/input.wav > output/input-ffprobe.json
"$PYTHON" transcribe.py output/input.wav output/run1.json > output/run1.log 2>&1 || { cat output/run1.log >&2; exit 1; }
"$PYTHON" transcribe.py output/input.wav output/run2.json > output/run2.log 2>&1 || { cat output/run2.log >&2; exit 1; }
"$PYTHON" check.py output
if [[ "${1:-}" == "--record" ]]; then
  cp output/checks.json expected/checks.json
  cp output/alignment.json expected/alignment.json
  echo "recorded expected/"
  exit 0
fi
diff expected/checks.json output/checks.json
diff expected/alignment.json output/alignment.json
echo "whisperx-word-timing: OK"
