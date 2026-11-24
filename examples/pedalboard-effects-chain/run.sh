#!/usr/bin/env bash
set -uo pipefail
cd "$(dirname "$0")"
PYTHON="${PEDALBOARD_EFFECTS_CHAIN_PYTHON:-$PWD/output/venv/bin/python}"
[[ -x "$PYTHON" ]] || { echo "Create output/venv and run pip install -r requirements.txt as in README.md; no automatic install." >&2; exit 1; }
mkdir -p output
"$PYTHON" -m pip --disable-pip-version-check freeze > output/dependencies.txt
"$PYTHON" chain.py output/run-a > output/checks.json 2> output/run-a.log || true
"$PYTHON" chain.py output/run-b > output/checks-rerun.json 2> output/run-b.log || true
[[ -s output/checks.json && -s output/checks-rerun.json ]] || { cat output/run-a.log output/run-b.log >&2; echo "pedalboard-effects-chain: a run produced no report" >&2; exit 1; }
cmp -s output/checks.json output/checks-rerun.json || { echo "pedalboard-effects-chain: reruns in separate processes differ" >&2; exit 1; }
if [[ "${1:-}" == "--record" ]]; then cp output/checks.json expected/checks.json; echo "recorded expected/"; fi
diff expected/checks.json output/checks.json || { echo "pedalboard-effects-chain: output differs from expected/" >&2; exit 1; }
grep -q '"all_passed": true' output/checks.json || { echo "pedalboard-effects-chain: predeclared claim checks failed (see output/checks.json)" >&2; exit 1; }
echo "pedalboard-effects-chain: OK"
