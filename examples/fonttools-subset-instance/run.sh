#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
VENV_BIN="$PWD/output/venv/bin"
PYTHON="$VENV_BIN/python"
PYFTSUBSET="$VENV_BIN/pyftsubset"
[[ -x "$PYTHON" && -x "$PYFTSUBSET" ]] || { echo "Create output/venv and run pip install -r requirements.txt as in README.md; no automatic install." >&2; exit 1; }
SOURCE=fonts/JetBrainsMono-Bold.ttf
TITLE="Type & Motion 2026"
mkdir -p output/logs
"$VENV_BIN/pip" --disable-pip-version-check freeze > output/dependencies.txt
UNICODES=$("$PYTHON" -c 'import sys; print(",".join(f"{ord(c):04X}" for c in sorted(set(sys.argv[1]))))' "$TITLE")
for run in a b; do
  "$PYFTSUBSET" "$SOURCE" --unicodes="$UNICODES" --output-file="output/subset-$run.ttf" > "output/logs/ttf-$run.log" 2>&1 || { cat "output/logs/ttf-$run.log" >&2; exit 1; }
  "$PYFTSUBSET" "$SOURCE" --unicodes="$UNICODES" --flavor=woff2 --output-file="output/subset-$run.woff2" > "output/logs/woff2-$run.log" 2>&1 || { cat "output/logs/woff2-$run.log" >&2; exit 1; }
done
"$PYTHON" check.py "$SOURCE" output > output/checks.json || { cat output/checks.json >&2; exit 1; }
if [[ "${1:-}" == "--record" ]]; then cp output/checks.json expected/checks.json; echo "recorded expected/"; exit 0; fi
diff expected/checks.json output/checks.json && echo "fonttools-subset-instance: OK"
