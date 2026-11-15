#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p output
if [[ ! -x output/venv/bin/python ]]; then
  python3 -m venv output/venv
fi
output/venv/bin/python -m pip install --disable-pip-version-check --quiet 'mido==1.3.2'
if [[ "${1:-}" == "--record" ]]; then
  output/venv/bin/python make_fixture.py
  output/venv/bin/python inspect_roundtrip.py --record
else
  output/venv/bin/python make_fixture.py
  output/venv/bin/python inspect_roundtrip.py
fi
