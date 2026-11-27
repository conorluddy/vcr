#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
VENV="$PWD/output/venv"
if [[ ! -x "$VENV/bin/python" ]]; then
  python3.12 -m venv "$VENV"
  "$VENV/bin/python" -m pip --disable-pip-version-check -q install -r requirements.txt
fi
PYTHON="$VENV/bin/python"
mkdir -p output expected
"$PYTHON" -m pip --disable-pip-version-check freeze > output/dependencies.txt
"$PYTHON" check.py > output/first.json 2> output/first.log
"$PYTHON" check.py > output/second.json 2> output/second.log
diff output/first.json output/second.json
if [[ "${1:-}" == "--record" ]]; then
  cp output/first.json expected/metrics.json
  echo "recorded expected/metrics.json"
else
  diff expected/metrics.json output/first.json
fi
if grep -q '"all_passed": true' output/first.json; then
  [[ "${1:-}" == "--record" ]] || echo "pixelsort-span-sort: OK"
else
  echo "KNOWN FAIL: a predeclared check failed; see expected/metrics.json"
fi
