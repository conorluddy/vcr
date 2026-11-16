#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
if [[ ! -x output/venv/bin/python ]]; then
  uv venv output/venv --python 3.12
  uv pip install --python output/venv/bin/python 'opentimelineio==0.18.1'
fi
output/venv/bin/python run.py "$@"
