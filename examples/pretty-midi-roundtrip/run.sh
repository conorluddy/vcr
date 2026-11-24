#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
export PYTHONDONTWRITEBYTECODE=1  # keep __pycache__ out of the committed example tree
PYTHON="$PWD/output/venv/bin/python"
[[ -x "$PYTHON" ]] || { echo "Create output/venv and pip install -r requirements.txt as in README.md; no automatic install." >&2; exit 1; }
"$PYTHON" -m pip --disable-pip-version-check freeze | diff requirements.txt - >&2 || { echo "installed packages differ from requirements.txt" >&2; exit 1; }
mkdir -p output
"$PYTHON" -m pip --disable-pip-version-check freeze > output/dependencies.txt
"$PYTHON" build_midi.py output/first.mid > output/build-first.log 2>&1 || { cat output/build-first.log >&2; exit 1; }
"$PYTHON" build_midi.py output/second.mid > output/build-second.log 2>&1 || { cat output/build-second.log >&2; exit 1; }
"$PYTHON" check.py output/first.mid output/second.mid > output/checks.json || { cat output/checks.json >&2; exit 1; }
if [[ "${1:-}" == "--record" ]]; then cp output/checks.json expected/metrics.json; echo "recorded expected/metrics.json"; exit 0; fi
diff expected/metrics.json output/checks.json && echo "OK pretty-midi-roundtrip"
