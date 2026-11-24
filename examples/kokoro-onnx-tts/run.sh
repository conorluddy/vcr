#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
PYTHON="${KOKORO_ONNX_PYTHON:-$PWD/output/venv/bin/python}"
[[ -x "$PYTHON" ]] || { echo "Create output/venv and pip install -r requirements.txt as in README.md; no automatic install." >&2; exit 1; }
[[ -f output/models/kokoro-v1.0.onnx && -f output/models/voices-v1.0.bin ]] || { echo "Run fetch-models.sh first (README.md)." >&2; exit 1; }
export HF_HOME="$PWD/output/cache/huggingface" XDG_CACHE_HOME="$PWD/output/cache/xdg" PIP_CACHE_DIR="$PWD/output/cache/pip" TMPDIR="$PWD/output/tmp"
mkdir -p output/tmp output/cache
"$PYTHON" -m pip --disable-pip-version-check freeze > output/dependencies.txt
"$PYTHON" synthesise.py output/models output/process1 > output/process1.log 2>&1 || { cat output/process1.log >&2; exit 1; }
"$PYTHON" synthesise.py output/models output/process2 > output/process2.log 2>&1 || { cat output/process2.log >&2; exit 1; }
"$PYTHON" check.py output/process1 output/process2 > output/checks.json || { cat output/checks.json >&2; exit 1; }
if [[ "${1:-}" == "--record" ]]; then cp output/checks.json expected/checks.json; echo "recorded expected/"; exit 0; fi
diff expected/checks.json output/checks.json && echo "kokoro-onnx-tts: OK"
