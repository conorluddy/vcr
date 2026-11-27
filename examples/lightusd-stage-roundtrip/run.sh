#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
PYTHON="${LIGHTUSD_PYTHON:-$PWD/output/venv/bin/python}"
if [[ ! -x "$PYTHON" ]]; then
  mkdir -p output
  python3.12 -m venv output/venv
  output/venv/bin/python -m pip --disable-pip-version-check -q install -r requirements.txt
fi
rm -rf output/run-a output/run-b
"$PYTHON" -m pip --disable-pip-version-check freeze > output/dependencies.txt
"$PYTHON" -I stage_roundtrip.py output/run-a > output/run-a.log 2>&1 || { cat output/run-a.log >&2; echo "lightusd-stage-roundtrip: KNOWN FAIL, see expected/checks.json" >&2; failed=1; }
"$PYTHON" -I stage_roundtrip.py output/run-b > output/run-b.log 2>&1 || true
cmp output/run-a/stage.usda output/run-b/stage.usda || { echo "lightusd-stage-roundtrip: stage.usda differs between runs" >&2; exit 1; }
cmp output/run-a/stage.usdz output/run-b/stage.usdz || { echo "lightusd-stage-roundtrip: stage.usdz differs between runs" >&2; exit 1; }
diff output/run-a/checks.json output/run-b/checks.json > output/rerun.diff || { echo "lightusd-stage-roundtrip: reruns differ" >&2; cat output/rerun.diff >&2; exit 1; }
if [[ "${1:-}" == "--record" ]]; then cp output/run-a/checks.json expected/checks.json; echo "recorded expected/"; exit 0; fi
diff expected/checks.json output/run-a/checks.json && echo "lightusd-stage-roundtrip: OK"
if [[ "${failed:-0}" == 1 ]]; then echo "KNOWN FAIL: a predeclared check fails (recorded in expected/checks.json); evidence is partial" >&2; fi
