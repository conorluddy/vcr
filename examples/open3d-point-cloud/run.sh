#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
PYTHON="${OPEN3D_PYTHON:-$PWD/output/venv/bin/python}"
[[ -x "$PYTHON" ]] || { echo "Create output/venv and run pip install -r requirements.txt as in README.md; no automatic install." >&2; exit 1; }
rm -rf output/run-a output/run-b
mkdir -p output
"$PYTHON" -m pip --disable-pip-version-check freeze > output/dependencies.txt
"$PYTHON" open3d_checks.py output/run-a > output/run-a.log 2>&1 || { cat output/run-a.log >&2; exit 1; }
"$PYTHON" open3d_checks.py output/run-b > output/run-b.log 2>&1 || { cat output/run-b.log >&2; exit 1; }
diff output/run-a/checks.json output/run-b/checks.json > output/rerun.diff || { echo "open3d-point-cloud: reruns differ, see output/rerun.diff" >&2; cat output/rerun.diff >&2; exit 1; }
if [[ "${1:-}" == "--record" ]]; then cp output/run-a/checks.json expected/checks.json; echo "recorded expected/"; exit 0; fi
diff expected/checks.json output/run-a/checks.json && echo "open3d-point-cloud: OK"
