#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
PYTHON="${ESSENTIA_PYTHON:-$PWD/output/venv/bin/python}"
[[ -x "$PYTHON" ]] || { echo "Create output/venv and run pip install -r requirements.txt as in README.md; no automatic install." >&2; exit 1; }
mkdir -p output
"$PYTHON" -m pip --disable-pip-version-check freeze > output/dependencies.txt
diff requirements.txt output/dependencies.txt > /dev/null || { echo "venv does not match requirements.txt" >&2; exit 1; }
status_a=0
status_b=0
"$PYTHON" analyse.py output/run-a.json > output/run-a.log 2>&1 || status_a=$?
"$PYTHON" analyse.py output/run-b.json > output/run-b.log 2>&1 || status_b=$?
diff output/run-a.json output/run-b.json > /dev/null || { echo "reruns differ: see output/run-a.json and output/run-b.json" >&2; exit 1; }
if (( status_a != 0 || status_b != 0 )); then
  echo "predeclared check failed (exit $status_a, $status_b); see output/run-a.log and output/run-a.json" >&2
  cat output/run-a.log >&2
  exit 1
fi
if [[ "${1:-}" == "--record" ]]; then mkdir -p expected; cp output/run-a.json expected/checks.json; echo "recorded expected/"; exit 0; fi
diff expected/checks.json output/run-a.json && echo "essentia-audio-features: OK"
