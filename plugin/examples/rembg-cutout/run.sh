#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
PYTHON="${REMBG_CUTOUT_PYTHON:-$PWD/output/venv/bin/python}"
[[ -x "$PYTHON" ]] || { echo "Create output/venv with rembg[cpu]==2.0.85 as in README.md; no automatic install." >&2; exit 1; }
mkdir -p output
"$PYTHON" -m pip --disable-pip-version-check freeze > output/dependencies.txt
"$PYTHON" generate.py output/scene.png output/scene.json > output/generate.log 2>&1 || { cat output/generate.log >&2; exit 1; }
"$PYTHON" cutout.py output/scene.png output/cutout.png > output/cutout.log 2>&1 || { cat output/cutout.log >&2; exit 1; }
"$PYTHON" cutout.py output/scene.png output/cutout-rerun.png > output/cutout-rerun.log 2>&1 || { cat output/cutout-rerun.log >&2; exit 1; }
"$PYTHON" check.py output/scene.png output/scene.json output/cutout.png output/cutout-rerun.png > output/checks.json || { cat output/checks.json >&2; exit 1; }
if [[ "${1:-}" == "--record" ]]; then mkdir -p expected && cp output/checks.json expected/checks.json; echo "recorded expected/"; exit 0; fi
diff expected/checks.json output/checks.json && echo "rembg-cutout: OK"
