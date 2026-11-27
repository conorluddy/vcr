#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
export PYTHONDONTWRITEBYTECODE=1
if [[ ! -x output/venv/bin/python ]]; then
  python3 -m venv output/venv
  output/venv/bin/pip install --disable-pip-version-check -q -r requirements.txt
fi
PYTHON="${PHIFLOW_PYTHON:-$PWD/output/venv/bin/python}"
mkdir -p output expected
"$PYTHON" -m pip --disable-pip-version-check freeze > output/dependencies.txt
"$PYTHON" -W ignore check.py > output/first.json
"$PYTHON" -W ignore check.py > output/second.json
diff output/first.json output/second.json
if [[ "${1:-}" == "--record" ]]; then
  cp output/first.json expected/metrics.json
  echo "recorded expected/metrics.json"
else
  diff expected/metrics.json output/first.json
fi
if ! grep -q '"all_passed": true' output/first.json; then
  echo "KNOWN FAIL (recorded in expected/metrics.json): predeclared checks that are false:" >&2
  grep ': false' output/first.json >&2
fi
[[ "${1:-}" == "--record" ]] || echo "phiflow-smoke-2d: OK (reproduces recorded result)"
