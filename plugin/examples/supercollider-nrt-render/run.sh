#!/usr/bin/env bash
# Render render.scd twice with sclang -D (Score.recordNRT drives scsynth -N, no audio device), then analyse both renders against the predeclared notes with analyse.py.
# Predeclared checks (see README "Plan, before running") must all pass before the summary is recorded or diffed.
set -euo pipefail
cd "$(dirname "$0")"

SCLANG_PATH="/Applications/SuperCollider.app/Contents/MacOS/sclang"
SCSYNTH_PATH="/Applications/SuperCollider.app/Contents/Resources/scsynth"
RENDER_TIMEOUT_S=120

if [[ ! -x "$SCLANG_PATH" || ! -x "$SCSYNTH_PATH" ]]; then
  echo "supercollider-nrt-render: missing sclang or scsynth; install with 'brew install --cask supercollider' (see README 'Plan, before running')" >&2
  exit 1
fi
if ! command -v python3 >/dev/null; then
  echo "supercollider-nrt-render: missing python3 (standard library only); see README 'Plan, before running'" >&2
  exit 1
fi

mkdir -p output expected
rm -f output/render-*.wav output/score.osc output/sclang-*.log output/summary.json output/spectrogram.ppm

# Headless sclang: -D runs the script without the IDE. macOS has no timeout(1), so perl enforces the limit.
if ! perl -e 'alarm shift; exec @ARGV' "$RENDER_TIMEOUT_S" "$SCLANG_PATH" -D render.scd > output/sclang-render.log 2>&1; then
  echo "supercollider-nrt-render: sclang did not finish within ${RENDER_TIMEOUT_S}s or failed; see output/sclang-render.log" >&2
  exit 1
fi
for wavFile in output/render-a.wav output/render-b.wav; do
  if [[ ! -s "$wavFile" ]]; then
    echo "supercollider-nrt-render: no $wavFile written; see output/sclang-render.log" >&2
    exit 1
  fi
done

# Analysis: format, frame count, onset, duration, pitch, peaks, silence, hashes and rerun identity; exits 1 if any predeclared check is false.
if ! python3 -I analyse.py render.scd output/render-a.wav output/render-b.wav output/spectrogram.ppm > output/summary.json; then
  echo "supercollider-nrt-render: predeclared check failed; see output/summary.json" >&2
  cat output/summary.json >&2
  exit 1
fi

if [[ "${1:-}" == "--record" ]]; then cp output/summary.json expected/summary.json; echo "recorded expected/"; exit 0; fi
diff expected/summary.json output/summary.json && echo "supercollider-nrt-render: OK"
