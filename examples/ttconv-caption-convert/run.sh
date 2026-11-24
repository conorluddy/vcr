#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
TT="${TTCONV_TT:-$PWD/output/venv/bin/tt}"
PYTHON="${TTCONV_PYTHON:-$PWD/output/venv/bin/python}"
[[ -x "$TT" ]] || { echo "Create output/venv and run pip install -r requirements.txt as in README.md; no automatic install." >&2; exit 1; }
CONFIG='{"srt_reader": {"extended_tags": true}}'
rm -rf output/captions.vtt output/captions.ttml output/roundtrip.srt output/rerun output/checks.json
mkdir -p output/rerun
"$PYTHON" -m pip --disable-pip-version-check freeze > output/dependencies.txt
"$TT" convert -i input/captions.srt -o output/captions.vtt --config "$CONFIG" > output/convert-vtt.log 2>&1 || { cat output/convert-vtt.log >&2; exit 1; }
"$TT" convert -i input/captions.srt -o output/captions.ttml --config "$CONFIG" > output/convert-ttml.log 2>&1 || { cat output/convert-ttml.log >&2; exit 1; }
"$TT" convert -i output/captions.vtt -o output/roundtrip.srt > output/convert-roundtrip.log 2>&1 || { cat output/convert-roundtrip.log >&2; exit 1; }
"$TT" convert -i input/captions.srt -o output/rerun/captions.vtt --config "$CONFIG" > output/convert-rerun.log 2>&1 || { cat output/convert-rerun.log >&2; exit 1; }
"$PYTHON" check.py output/captions.vtt output/captions.ttml output/roundtrip.srt output/rerun/captions.vtt > output/checks.json || { cat output/checks.json >&2; exit 1; }
if [[ "${1:-}" == "--record" ]]; then cp output/checks.json expected/checks.json; echo "recorded expected/"; exit 0; fi
diff expected/checks.json output/checks.json && echo "ttconv-caption-convert: OK"
