#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
PYTHON="${PYVISTA_PYTHON:-$PWD/output/venv/bin/python}"
mkdir -p output expected
if [[ ! -x "$PYTHON" ]]; then
  # Venv lives in the ignored output/ directory; nothing is installed on the machine.
  python3.12 -m venv output/venv
  output/venv/bin/pip install --disable-pip-version-check -q -r requirements.txt
fi
"$PYTHON" -m pip --disable-pip-version-check freeze > output/dependencies.txt
"$PYTHON" render.py > output/first.json
cp output/scene.png output/first.png
"$PYTHON" render.py > output/second.json
diff output/first.json output/second.json
cmp output/first.png output/scene.png
if [[ "${1:-}" == "--record" ]]; then
  cp output/first.json expected/metrics.json
  echo "recorded expected/metrics.json"
else
  diff expected/metrics.json output/first.json
fi
grep -q '"all_passed": true' output/first.json || { echo "a predeclared check failed; see output/first.json" >&2; exit 1; }
[[ "${1:-}" == "--record" ]] || echo "pyvista-offscreen-render: OK"
