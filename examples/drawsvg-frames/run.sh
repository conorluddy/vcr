#!/usr/bin/env bash
# Generate drawsvg frames three times (sequential, rerun, shuffled), rasterise with resvg,
# run the predeclared checks, and diff the result against expected/.
set -euo pipefail
cd "$(dirname "$0")"
PYTHON="${DRAWSVG_FRAMES_PYTHON:-$PWD/output/venv/bin/python}"
[[ -x "$PYTHON" ]] || { echo "Create output/venv and run pip install -r requirements.txt as in README.md; no automatic install." >&2; exit 1; }
command -v resvg >/dev/null || { echo "resvg is not on PATH; install it as listed in the catalogue, no automatic install." >&2; exit 1; }

rm -rf output/svg-sequential output/svg-rerun output/svg-shuffled output/png-sequential output/png-shuffled
mkdir -p output
"$PYTHON" -m pip --disable-pip-version-check freeze > output/dependencies.txt
resvg --version > output/resvg-version.txt

"$PYTHON" generate.py output/svg-sequential sequential
"$PYTHON" generate.py output/svg-rerun sequential
"$PYTHON" generate.py output/svg-shuffled shuffled

: > output/resvg.log
rasterise_directory() {
  local svgDirectory="$1" pngDirectory="$2"
  mkdir -p "$pngDirectory"
  for svgPath in "$svgDirectory"/frame-*.svg; do
    local frameName
    frameName="$(basename "$svgPath" .svg)"
    resvg --skip-system-fonts --use-font-file fonts/JetBrainsMono-Bold.ttf \
      "$svgPath" "$pngDirectory/$frameName.png" >> output/resvg.log 2>&1 \
      || { cat output/resvg.log >&2; exit 1; }
  done
}
rasterise_directory output/svg-sequential output/png-sequential
rasterise_directory output/svg-shuffled output/png-shuffled

"$PYTHON" check.py output > output/checks.json || { cat output/checks.json >&2; exit 1; }
if [[ "${1:-}" == "--record" ]]; then cp output/checks.json expected/checks.json; echo "recorded expected/"; exit 0; fi
diff expected/checks.json output/checks.json && echo "drawsvg-frames: OK"
