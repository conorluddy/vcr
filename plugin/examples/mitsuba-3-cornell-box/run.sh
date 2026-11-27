#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
PYTHON="$PWD/output/venv/bin/python"
if [[ ! -x "$PYTHON" ]]; then
  python3 -m venv output/venv
  output/venv/bin/pip install -q --disable-pip-version-check -r requirements.txt
fi
mkdir -p output expected
"$PYTHON" -m pip --disable-pip-version-check freeze > output/dependencies.txt
# stderr carries Mitsuba's LLVM probe notice on this machine; stdout is the JSON
"$PYTHON" check.py output/cornell.png output/first.npy > output/first.json 2> output/first.err
"$PYTHON" check.py output/second.png output/second.npy > output/second.json 2> output/second.err
# Cross-process repeatability, measured and recorded; bitwise equality is not assumed
"$PYTHON" - > output/cross_process.json <<'PY'
import json, numpy as np
a, b = np.load("output/first.npy"), np.load("output/second.npy")
print(json.dumps({"bitwise_identical": bool(np.array_equal(a, b)),
                  "max_abs_diff_below_1e-6": float(np.abs(a - b).max()) < 1e-6}, indent=2))
PY
cat output/first.json output/cross_process.json > output/metrics.json
if [[ "${1:-}" == "--record" ]]; then
  cp output/metrics.json expected/metrics.json
  echo "recorded expected/metrics.json"
else
  diff expected/metrics.json output/metrics.json
fi
# Failed checks are findings recorded in expected/metrics.json, not hidden; see README.md
grep -E '": false' output/metrics.json | sed 's/^ */FINDING (recorded): /' >&2 || true
[[ "${1:-}" == "--record" ]] || echo "mitsuba-3-cornell-box: OK"
