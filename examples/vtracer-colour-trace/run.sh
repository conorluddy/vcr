#!/usr/bin/env bash
# Draw the source PNG, trace it in two separate vtracer processes, rasterise both SVGs with resvg,
# run the predeclared checks, and diff the result against expected/.
set -euo pipefail
cd "$(dirname "$0")"
PYTHON="${VTRACER_PYTHON:-$PWD/output/venv/bin/python}"
[[ -x "$PYTHON" ]] || { echo "Create output/venv and pip install -r requirements.txt as in README.md; no automatic install." >&2; exit 1; }
command -v resvg >/dev/null || { echo "resvg is not on PATH; install it as listed in the catalogue, no automatic install." >&2; exit 1; }
command -v magick >/dev/null || { echo "magick is not on PATH; install ImageMagick as listed in the catalogue, no automatic install." >&2; exit 1; }
test "$(resvg --version)" = "0.47.0" || { echo "expected resvg 0.47.0, got $(resvg --version)" >&2; exit 1; }

rm -f output/source.png output/trace.svg output/trace-rerun.svg output/rendered.png output/rendered-rerun.png output/checks.json
mkdir -p output
"$PYTHON" -m pip --disable-pip-version-check freeze > output/dependencies.txt
resvg --version > output/resvg-version.txt
magick --version | head -1 > output/imagemagick-version.txt

magick -size 240x240 xc:'#FFFFFF' \
  -fill '#DC1E1E' -draw 'circle 60,60 100,60' \
  -fill '#1E3CC8' -draw 'rectangle 130,20 209,99' \
  -fill '#1EA03C' -draw 'polygon 40,230 120,140 200,230' \
  PNG24:output/source.png

"$PYTHON" trace.py output/source.png output/trace.svg
"$PYTHON" trace.py output/source.png output/trace-rerun.svg
resvg output/trace.svg output/rendered.png
resvg output/trace-rerun.svg output/rendered-rerun.png

"$PYTHON" check.py output > output/checks.json || { cat output/checks.json >&2; exit 1; }
if [[ "${1:-}" == "--record" ]]; then cp output/checks.json expected/checks.json; echo "recorded expected/"; exit 0; fi
diff expected/checks.json output/checks.json && echo "vtracer-colour-trace: OK"
