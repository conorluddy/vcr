#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
PYTHON="${SEGMENT_ANYTHING_POINT_PROMPT_PYTHON:-$PWD/output/venv/bin/python}"
[[ -x "$PYTHON" ]] || { echo "Create output/venv from requirements.txt as in README.md; no automatic install." >&2; exit 1; }
export HF_HOME="$PWD/output/cache"
export TORCH_HOME="$PWD/output/cache"
mkdir -p output
"$PYTHON" -m pip --disable-pip-version-check freeze > output/dependencies.txt
"$PYTHON" generate.py output/scene.png output/scene.json > output/generate.log 2>&1 || { cat output/generate.log >&2; exit 1; }
"$PYTHON" segment.py output/scene.png output/scene.json output/run-1 > output/segment-run-1.log 2>&1 || { cat output/segment-run-1.log >&2; exit 1; }
"$PYTHON" segment.py output/scene.png output/scene.json output/run-2 > output/segment-run-2.log 2>&1 || { cat output/segment-run-2.log >&2; exit 1; }
"$PYTHON" check.py output/scene.png output/scene.json output/run-1 output/run-2 > output/checks.json || { cat output/checks.json >&2; exit 1; }
if [[ "${1:-}" == "--record" ]]; then mkdir -p expected && cp output/checks.json expected/checks.json; echo "recorded expected/"; exit 0; fi
diff expected/checks.json output/checks.json && echo "segment-anything-point-prompt: OK"
