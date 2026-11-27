#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
export PYTHONDONTWRITEBYTECODE=1
mkdir -p output expected
if [[ ! -x output/venv/bin/python ]]; then
  python3 -m venv output/venv
  output/venv/bin/pip install --disable-pip-version-check -q -r requirements.txt
fi
PYTHON=output/venv/bin/python
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
[[ "${1:-}" == "--record" ]] || echo "pygfx-offscreen-scene: OK"
