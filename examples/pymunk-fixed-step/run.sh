#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
export PYTHONDONTWRITEBYTECODE=1
PYTHON="${PYMUNK_FIXED_STEP_PYTHON:-$PWD/output/venv/bin/python}"
[[ -x "$PYTHON" ]] || { echo "Create output/venv and pip install -r requirements.txt as in README.md; no automatic install." >&2; exit 1; }
mkdir -p output
"$PYTHON" -m pip --disable-pip-version-check freeze > output/dependencies.txt
"$PYTHON" generate.py output/simulation.json > output/generate.log 2>&1 || { cat output/generate.log >&2; exit 1; }
"$PYTHON" generate.py output/simulation-rerun.json > output/generate-rerun.log 2>&1 || { cat output/generate-rerun.log >&2; exit 1; }
"$PYTHON" check.py output/simulation.json output/simulation-rerun.json > output/checks.json || { cat output/checks.json >&2; exit 1; }
if [[ "${1:-}" == "--record" ]]; then
  cp output/simulation.json expected/states.json
  cp output/checks.json expected/checks.json
  echo "recorded expected/"
  exit 0
fi
diff expected/checks.json output/checks.json
diff expected/states.json output/simulation.json
echo "pymunk-fixed-step: OK"
