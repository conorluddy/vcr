#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
if [[ ! -x output/venv/bin/python ]]; then
  python3.12 -m venv output/venv
  output/venv/bin/pip --disable-pip-version-check -q install -r requirements.txt
fi
PYTHON="$PWD/output/venv/bin/python"
"$PYTHON" -m pip --disable-pip-version-check freeze > output/dependencies.txt
mkdir -p expected
"$PYTHON" -I check.py > output/first.json
"$PYTHON" -I check.py > output/second.json
diff output/first.json output/second.json
if [[ "${1:-}" == "--record" ]]; then
  cp output/first.json expected/metrics.json
  echo "recorded expected/metrics.json"
else
  diff expected/metrics.json output/first.json
fi
if grep -q '"all_passed": true' output/first.json; then
  [[ "${1:-}" == "--record" ]] || echo "pyseq-frame-gaps: OK"
else
  echo "KNOWN FAIL: predeclared check(s) failed, recorded in expected/metrics.json: $("$PYTHON" -I -c 'import json;print(*json.load(open("output/first.json"))["failed"])')"
fi
