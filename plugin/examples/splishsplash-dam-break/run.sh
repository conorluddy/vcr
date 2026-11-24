#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
export PYTHONDONTWRITEBYTECODE=1
PYTHON="${SPLISHSPLASH_DAM_BREAK_PYTHON:-$PWD/output/venv/bin/python}"
[[ -x "$PYTHON" ]] || { echo "Create output/venv and pip install -r requirements.txt as in README.md; no automatic install." >&2; exit 1; }
mkdir -p output
"$PYTHON" -m pip --disable-pip-version-check freeze > output/dependencies.txt
"$PYTHON" generate.py output/simulation.json > output/generate.log 2>&1 || { tail -40 output/generate.log >&2; exit 1; }
"$PYTHON" generate.py output/simulation-rerun.json > output/generate-rerun.log 2>&1 || { tail -40 output/generate-rerun.log >&2; exit 1; }
rm -rf output/seek
mkdir -p output/seek
# Predeclared seek order (a shuffle of the frame steps), one fresh process per step.
index=0
for step in 375 1 500 125 250; do
  index=$((index + 1))
  seekName=$(printf 'seek-%02d-%d.json' "$index" "$step")
  "$PYTHON" generate.py "output/seek/$seekName" --seek "$step" > "output/seek/seek-$step.log" 2>&1 || { tail -40 "output/seek/seek-$step.log" >&2; exit 1; }
done
"$PYTHON" check.py output/simulation.json output/simulation-rerun.json output/seek > output/checks.json || { cat output/checks.json >&2; exit 1; }
if [[ "${1:-}" == "--record" ]]; then
  cp output/checks.json expected/checks.json
  echo "recorded expected/checks.json"
  exit 0
fi
diff expected/checks.json output/checks.json
echo "splishsplash-dam-break: OK"
