#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
PYTHON="${GENERATIVEPY_PYTHON:-$PWD/output/venv/bin/python}"
[[ -x "$PYTHON" ]] || { echo "Create output/venv and pip install -r requirements.txt as in README.md; no automatic install." >&2; exit 1; }
mkdir -p output
"$PYTHON" -m pip --disable-pip-version-check freeze > output/dependencies.txt
"$PYTHON" generate.py output/run-a > output/generate-a.log 2>&1 || { cat output/generate-a.log >&2; exit 1; }
"$PYTHON" generate.py output/run-b > output/generate-b.log 2>&1 || { cat output/generate-b.log >&2; exit 1; }
"$PYTHON" check.py output/run-a output/run-b > output/checks.json || { cat output/checks.json >&2; exit 1; }
if [[ "${1:-}" == "--record" ]]; then cp output/checks.json expected/checks.json; echo "recorded expected/"; exit 0; fi
diff expected/checks.json output/checks.json && echo "generativepy-frames: OK"
