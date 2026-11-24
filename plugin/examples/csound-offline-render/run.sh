#!/usr/bin/env bash
# Render fixture.csd twice with csound -W -o (offline, no device), then analyse both renders against the predeclared score with analyse.py.
# Predeclared checks (see README "Plan, before running") must all pass before the summary is recorded or diffed.
set -euo pipefail
cd "$(dirname "$0")"

if ! command -v csound >/dev/null; then
  echo "csound-offline-render: missing csound; install with 'brew install csound' (see README 'Plan, before running')" >&2
  exit 1
fi
if ! command -v python3 >/dev/null; then
  echo "csound-offline-render: missing python3 (standard library only); see README 'Plan, before running'" >&2
  exit 1
fi

mkdir -p output expected
rm -f output/render-*.wav output/csound-*.log output/summary.json output/spectrogram.ppm

# Offline render: -W writes a WAV, -o names it; no realtime audio device is opened.
renderTo() {
  local outputWav="$1" logFile="$2"
  if ! csound -W -o "$outputWav" fixture.csd > "$logFile" 2>&1; then
    echo "csound-offline-render: csound failed for $outputWav; see $logFile" >&2
    exit 1
  fi
}
renderTo output/render-a.wav output/csound-a.log
renderTo output/render-b.wav output/csound-b.log

# Analysis: frequency, onset, peak, silence, hashes and rerun identity; exits 1 if any predeclared check is false.
if ! python3 analyse.py fixture.csd output/render-a.wav output/render-b.wav output/spectrogram.ppm > output/summary.json; then
  echo "csound-offline-render: predeclared check failed; see output/summary.json" >&2
  cat output/summary.json >&2
  exit 1
fi

if [[ "${1:-}" == "--record" ]]; then cp output/summary.json expected/summary.json; echo "recorded expected/"; exit 0; fi
diff expected/summary.json output/summary.json && echo "csound-offline-render: OK"
