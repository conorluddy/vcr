#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
PYTHON="${OPENUSD_PYTHON:-$PWD/output/venv/bin/python}"
[[ -x "$PYTHON" ]] || { echo "Create output/venv and run pip install -r requirements.txt as in README.md; no automatic install." >&2; exit 1; }
rm -rf output/run-a output/run-b
mkdir -p output
"$PYTHON" -m pip --disable-pip-version-check freeze > output/dependencies.txt
"$PYTHON" stage_roundtrip.py output/run-a > output/run-a.log 2>&1 || { cat output/run-a.log >&2; exit 1; }
"$PYTHON" stage_roundtrip.py output/run-b > output/run-b.log 2>&1 || { cat output/run-b.log >&2; exit 1; }
cmp output/run-a/stage.usda output/run-b/stage.usda || { echo "openusd-stage-roundtrip: stage.usda differs between runs" >&2; exit 1; }
diff output/run-a/checks.json output/run-b/checks.json > output/rerun.diff || { echo "openusd-stage-roundtrip: reruns differ, see output/rerun.diff" >&2; cat output/rerun.diff >&2; exit 1; }
if [[ "${1:-}" == "--record" ]]; then cp output/run-a/checks.json expected/checks.json; echo "recorded expected/"; exit 0; fi
diff expected/checks.json output/run-a/checks.json && echo "openusd-stage-roundtrip: OK"
if grep -q '"G7_usdchecker_clean": null' output/run-a/checks.json; then
  echo "openusd-stage-roundtrip: G7 usdchecker not run (not shipped by usd-core); result is partial" >&2
fi
