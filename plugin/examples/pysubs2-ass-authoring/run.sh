#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
PYTHON="${PYSUBS2_PYTHON:-$PWD/output/venv/bin/python}"
[[ -x "$PYTHON" ]] || { echo "Create output/venv and pip install -r requirements.txt as in README.md; no automatic install." >&2; exit 1; }
mkdir -p output expected
"$PYTHON" -m pip --disable-pip-version-check freeze > output/dependencies.txt
"$PYTHON" check.py > output/first.json
"$PYTHON" check.py > output/second.json
diff output/first.json output/second.json
if [[ "${1:-}" == "--record" ]]; then
  cp output/first.json expected/metrics.json
  echo "recorded expected/metrics.json"
else
  diff expected/metrics.json output/first.json
fi
grep -q '"all_passed": true' output/first.json || { echo "a predeclared check failed; see output/first.json" >&2; exit 1; }
[[ "${1:-}" == "--record" ]] || echo "pysubs2-ass-authoring: OK"
