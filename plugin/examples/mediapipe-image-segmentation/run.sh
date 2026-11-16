#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
PYTHON_BIN="${PYTHON_BIN:-python3}"
mkdir -p output
if [[ ! -x output/venv/bin/python ]]; then
  "$PYTHON_BIN" -m venv output/venv
fi
output/venv/bin/python -m pip install --disable-pip-version-check -r requirements.lock.txt
output/venv/bin/python segment.py "$@"
