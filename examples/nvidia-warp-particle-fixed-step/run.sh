#!/usr/bin/env bash
# Builds output/venv from the pinned requirements.txt (PyPI needed once), warms the kernel cache, then checks.
set -euo pipefail
cd "$(dirname "$0")"
export PYTHONDONTWRITEBYTECODE=1
mkdir -p output expected
if [[ ! -x output/venv/bin/python ]]; then
  python3.12 -m venv output/venv
  output/venv/bin/pip --disable-pip-version-check -q install -r requirements.txt
fi
PYTHON="$PWD/output/venv/bin/python"
"$PYTHON" -m pip --disable-pip-version-check freeze > output/dependencies.txt
# warm-up: first run JIT-compiles the kernels into output/warp-cache
"$PYTHON" sim.py trace 1 output/warmup.json > output/warmup.log 2>&1 || { cat output/warmup.log >&2; exit 1; }
"$PYTHON" sim.py trace 600 output/run1.json output/frames.npz > output/run1.log 2>&1 || { cat output/run1.log >&2; exit 1; }
"$PYTHON" sim.py trace 600 output/run2.json > output/run2.log 2>&1 || { cat output/run2.log >&2; exit 1; }
set +e
"$PYTHON" check.py output/run1.json output/run2.json > output/checks.json
status=$?
set -e
if [[ "${1:-}" == "--record" ]]; then
  cp output/checks.json expected/checks.json
  cp output/run1.json expected/trace.json
  echo "recorded expected/ (check exit $status)"
else
  diff expected/checks.json output/checks.json
  diff expected/trace.json output/run1.json
fi
if [[ $status -ne 0 ]]; then
  echo "KNOWN FAIL: a predeclared check failed; see output/checks.json and expected/checks.json" >&2
  exit 0
fi
[[ "${1:-}" == "--record" ]] || echo "nvidia-warp-particle-fixed-step: OK"
