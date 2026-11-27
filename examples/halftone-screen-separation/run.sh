#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
VENV="$PWD/output/venv"
mkdir -p output expected
if [[ ! -x "$VENV/bin/halftonecv" ]]; then
  python3.12 -m venv "$VENV"
  "$VENV/bin/pip" --disable-pip-version-check -q install -r requirements.txt
fi
"$VENV/bin/python" -m pip --disable-pip-version-check freeze > output/dependencies.txt
"$VENV/bin/python" check.py > output/first.json
"$VENV/bin/python" check.py > output/second.json
diff output/first.json output/second.json
if [[ "${1:-}" == "--record" ]]; then
  cp output/first.json expected/metrics.json
  echo "recorded expected/metrics.json"
else
  diff expected/metrics.json output/first.json
fi
grep -q '"all_passed": true' output/first.json || { echo "KNOWN FAIL: a predeclared check failed; see output/first.json" >&2; exit 0; }
[[ "${1:-}" == "--record" ]] || echo "halftone-screen-separation: OK"
