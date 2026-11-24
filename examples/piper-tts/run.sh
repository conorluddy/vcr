#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
PYTHON="${PIPER_TTS_PYTHON:-$PWD/output/venv/bin/python}"
VOICE="$PWD/output/voices/en_US-ryan-low"
[[ -x "$PYTHON" ]] || { echo "Create output/venv and pip install piper-tts==1.8.0 as in README.md; no automatic install." >&2; exit 1; }
[[ -f "$VOICE.onnx" && -f "$VOICE.onnx.json" && -f "$PWD/output/voices/MODEL_CARD" ]] || { echo "Download the voice files into output/voices as in README.md." >&2; exit 1; }
export PIP_CACHE_DIR="$PWD/output/pip-cache" XDG_CACHE_HOME="$PWD/output/cache"
mkdir -p output/cache output/pip-cache
"$PYTHON" -m pip --disable-pip-version-check freeze > output/dependencies.txt

synthesise() {
  "$PYTHON" -m piper -m "$VOICE.onnx" -c "$VOICE.onnx.json" -f "output/$1.wav" --length-scale "$2" -i sentence.txt > "output/$1.log" 2>&1 || { cat "output/$1.log" >&2; exit 1; }
}
synthesise default-a 1.0
synthesise default-b 1.0
synthesise long-1.5 1.5

if ! "$PYTHON" check.py output > output/check.log 2>&1; then
  cat output/check.log >&2
  exit 1
fi
if [[ "${1:-}" == "--record" ]]; then
  cp output/voice.json expected/voice.json
  cp output/checks.json expected/checks.json
  echo "recorded expected/"
  exit 0
fi
diff expected/voice.json output/voice.json
diff expected/checks.json output/checks.json
echo "piper-tts: OK"
