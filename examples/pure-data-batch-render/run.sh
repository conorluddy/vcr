#!/usr/bin/env bash
# Render fixture.pd twice with Pd in batch mode (-nogui -batch), each run in its own output directory, then analyse run-a with analyse.py and byte-compare both renders.
# Predeclared checks (see README "Plan, before running") must all pass before the summary is recorded or diffed.
set -euo pipefail
cd "$(dirname "$0")"

PD_BIN="${PD_BIN:-/Applications/Pd-0.57-0.app/Contents/Resources/bin/pd}"
if [[ ! -x "$PD_BIN" ]]; then
  echo "pure-data-batch-render: missing Pd binary at $PD_BIN; install with 'brew install --cask pd' or set PD_BIN (see README 'Plan, before running')" >&2
  exit 1
fi
if ! command -v python3 >/dev/null; then
  echo "pure-data-batch-render: missing python3 (standard library only); see README 'Plan, before running'" >&2
  exit 1
fi

mkdir -p output expected
rm -rf output/run-a output/run-b output/pd-*.log output/summary.json

# Each run gets its own copy of the patch: writesf~ writes render.wav beside the patch, so the directory is the output location.
renderTo() {
  local runDirectory="$1" logFile="$2"
  mkdir -p "$runDirectory"
  cp fixture.pd "$runDirectory/fixture.pd"
  if ! "$PD_BIN" -nogui -batch -r 48000 -open "$PWD/$runDirectory/fixture.pd" > "$logFile" 2>&1; then
    echo "pure-data-batch-render: pd failed for $runDirectory; see $logFile" >&2
    exit 1
  fi
  if [[ ! -f "$runDirectory/render.wav" ]]; then
    echo "pure-data-batch-render: no render.wav in $runDirectory; see $logFile" >&2
    exit 1
  fi
}
renderTo output/run-a output/pd-a.log
renderTo output/run-b output/pd-b.log

# Analysis: rate, channels, width, duration, envelope times, tone, tail, segments and rerun identity; exits 1 if any predeclared check is false.
if ! python3 analyse.py output/run-a/render.wav output/run-b/render.wav > output/summary.json; then
  echo "pure-data-batch-render: predeclared check failed; see output/summary.json" >&2
  cat output/summary.json >&2
  exit 1
fi

if [[ "${1:-}" == "--record" ]]; then cp output/summary.json expected/summary.json; echo "recorded expected/"; exit 0; fi
diff expected/summary.json output/summary.json && echo "pure-data-batch-render: OK"
