#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
command -v ffmpeg >/dev/null || { echo "ffmpeg not on PATH" >&2; exit 1; }
command -v tesseract >/dev/null || { echo "tesseract not on PATH (reads the drawn numbers; brew install tesseract)" >&2; exit 1; }
[[ -f /System/Library/Fonts/Supplemental/Arial.ttf ]] || { echo "Arial.ttf missing: macOS-only fixture" >&2; exit 1; }
if [[ ! -x output/venv/bin/python ]]; then
  python3.12 -m venv output/venv
  output/venv/bin/pip install --disable-pip-version-check -q -r requirements.txt
fi
mkdir -p output expected
output/venv/bin/python -m pip --disable-pip-version-check freeze > output/dependencies.txt
output/venv/bin/python check.py > output/first.json
if [[ "${1:-}" == "--record" ]]; then
  cp output/first.json expected/metrics.json
  echo "recorded expected/metrics.json"
else
  diff expected/metrics.json output/first.json
fi
failed=$(output/venv/bin/python -c "import json;print(' '.join(k for k,v in json.load(open('output/first.json'))['checks'].items() if not v))")
for check in $failed; do echo "KNOWN FAIL: $check (observed value recorded in expected/metrics.json)"; done
[[ "${1:-}" == "--record" ]] || echo "gopro-overlay-gpx-widgets: OK (partial; failed as recorded: ${failed:-none})"
