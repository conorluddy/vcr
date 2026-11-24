#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
PYTHON="${FOGLEMAN_SDF_PYTHON:-$PWD/output/venv/bin/python}"
[[ -x "$PYTHON" ]] || { echo "Create output/venv and run pip install -e output/src as in README.md; no automatic install." >&2; exit 1; }
mkdir -p output
"$PYTHON" -m pip --disable-pip-version-check freeze > output/dependencies.txt
"$PYTHON" generate.py output/classic.stl > output/generate.log 2>&1 || { cat output/generate.log >&2; exit 1; }
"$PYTHON" generate.py output/classic-rerun.stl > output/generate-rerun.log 2>&1 || { cat output/generate-rerun.log >&2; exit 1; }
"$PYTHON" check.py output/classic.stl output/classic-rerun.stl > output/checks.json || { cat output/checks.json >&2; exit 1; }
if [[ "${1:-}" == "--record" ]]; then cp output/checks.json expected/checks.json; echo "recorded expected/"; exit 0; fi
diff expected/checks.json output/checks.json && echo "fogleman-sdf-mesh: OK"
