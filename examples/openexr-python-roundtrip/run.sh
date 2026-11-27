#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
PYTHON="$PWD/output/venv/bin/python"
if [[ ! -x "$PYTHON" ]]; then
  # Project-local venv from the official PyPI wheels; nothing is installed machine-wide.
  mkdir -p output
  python3 -m venv output/venv
  "$PYTHON" -m pip --disable-pip-version-check install -q -r requirements.txt
fi
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
[[ "${1:-}" == "--record" ]] || echo "openexr-python-roundtrip: OK"
