#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
if [[ ! -x output/venv/bin/python ]]; then
  python3.12 -m venv output/venv
  output/venv/bin/pip --disable-pip-version-check install -q -r requirements.txt
fi
mkdir -p output expected
output/venv/bin/python -m pip --disable-pip-version-check freeze > output/dependencies.txt
output/venv/bin/python check.py > output/first.json
output/venv/bin/python check.py > output/second.json
diff output/first.json output/second.json
if [[ "${1:-}" == "--record" ]]; then
  cp output/first.json expected/metrics.json
  echo "recorded expected/metrics.json"
else
  diff expected/metrics.json output/first.json
fi
if grep -q '"all_passed": true' output/first.json; then
  [[ "${1:-}" == "--record" ]] || echo "ffsubsync-offset-correction: OK"
else
  echo "ffsubsync-offset-correction: KNOWN FAIL (default flags on a 30 s clip; see expected/metrics.json)"
fi
