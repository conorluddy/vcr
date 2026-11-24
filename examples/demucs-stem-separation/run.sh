#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
PYTHON="$PWD/output/venv/bin/python"
[[ -x "$PYTHON" ]] || { echo "Create output/venv with uv (Python 3.12) and pip install -r requirements.txt as in README.md; no automatic install." >&2; exit 1; }
export HF_HOME="$PWD/output/cache" TORCH_HOME="$PWD/output/cache" XDG_CACHE_HOME="$PWD/output/cache"
SENTENCE="the quick brown fox jumps over the lazy dog"

if ! "$PYTHON" -c "import numpy, demucs.separate" >/dev/null 2>&1; then
  echo "demucs-stem-separation: BLOCKED. output/venv cannot import numpy and demucs; see README.md." >&2
  exit 3
fi

rm -rf output/sep1 output/sep2 output/truth output/*.json output/*.log output/vocals.* output/input.wav

# Vocals-like source: macOS say, converted to 44.1 kHz stereo float (construction only).
say -v Samantha -o output/vocals.aiff "$SENTENCE"
ffmpeg -y -loglevel error -i output/vocals.aiff -ac 2 -ar 44100 -c:a pcm_f32le output/vocals.wav

"$PYTHON" make_input.py output
ffprobe -v error -show_entries stream=codec_name,sample_rate,channels -show_entries format=duration -of json output/input.wav > output/input-ffprobe.json

"$PYTHON" -m demucs -n htdemucs --shifts 0 -d cpu --float32 -o output/sep1 output/input.wav > output/sep1.log 2>&1 || { cat output/sep1.log >&2; exit 1; }
"$PYTHON" -m demucs -n htdemucs --shifts 0 -d cpu --float32 -o output/sep2 output/input.wav > output/sep2.log 2>&1 || { cat output/sep2.log >&2; exit 1; }

"$PYTHON" check.py output

if ! grep -q '"all_gated_checks_pass": true' output/checks.json; then
  echo "demucs-stem-separation: FAIL. A gated check (C1 to C4) did not pass; see output/checks.json and output/metrics.json." >&2
  exit 1
fi

if [[ "${1:-}" == "--record" ]]; then
  mkdir -p expected
  cp output/checks.json expected/checks.json
  echo "recorded expected/checks.json"
  exit 0
fi
diff expected/checks.json output/checks.json
echo "demucs-stem-separation: OK"
