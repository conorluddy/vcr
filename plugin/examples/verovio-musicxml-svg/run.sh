#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
PYTHON="${VEROVIO_PYTHON:-$PWD/output/venv/bin/python}"
[[ -x "$PYTHON" ]] || { echo "Create output/venv and pip install -r requirements.txt as in README.md; no automatic install." >&2; exit 1; }
mkdir -p output expected
"$PYTHON" render.py > output/first.json
"$PYTHON" render.py > output/second.json
diff output/first.json output/second.json || { echo "FAIL: output differs between processes" >&2; exit 1; }
resvg --width 1800 --background white output/score.svg output/score.png
magick identify -format '%wx%h\n' output/score.png > output/size.txt
if [[ "${1:-}" == "--record" ]]; then
  cp output/first.json expected/metrics.json
  cp output/size.txt expected/png-size.txt
fi
diff expected/metrics.json output/first.json
diff expected/png-size.txt output/size.txt
echo "OK: verovio-musicxml-svg"
