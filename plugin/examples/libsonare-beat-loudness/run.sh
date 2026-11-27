#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
command -v sox > /dev/null || { echo "sox is required on PATH" >&2; exit 1; }
mkdir -p output
if [[ ! -x output/venv/bin/python ]]; then
  python3.12 -m venv output/venv
  output/venv/bin/python -m pip --disable-pip-version-check -q install -r requirements.txt
fi
PYTHON=output/venv/bin/python
"$PYTHON" -m pip --disable-pip-version-check freeze > output/dependencies.txt
diff requirements.txt output/dependencies.txt > /dev/null || { echo "venv does not match requirements.txt" >&2; exit 1; }
# 997 Hz mono sine, peak 0.1 (-20 dBFS): true integrated loudness is 20*log10(0.1) - 3.01 = -23.01 LUFS
sox -n -r 22050 -b 16 -c 1 output/sine.wav synth 5 sine 997 vol 0.1
"$PYTHON" analyse.py output/run-a.json output/sine.wav | tee output/run-a.log
"$PYTHON" analyse.py output/run-b.json output/sine.wav > output/run-b.log
diff output/run-a.json output/run-b.json > /dev/null || { echo "reruns differ" >&2; exit 1; }
if [[ "${1:-}" == "--record" ]]; then mkdir -p expected; cp output/run-a.json expected/checks.json; echo "recorded expected/"; exit 0; fi
diff expected/checks.json output/run-a.json && echo "libsonare-beat-loudness: OK"
