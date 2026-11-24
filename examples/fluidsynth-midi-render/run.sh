#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

SOUNDFONT_SHA256=52132b2b83994f0067d3a66b93b4f1b67d53ff8c0d3be90d39f23f92b4585cdd
SOUNDFONT="output/soundfont/VintageDreamsWaves-v2.sf2"
mkdir -p output/soundfont

if ! command -v fluidsynth >/dev/null 2>&1; then
  echo "blocked: fluidsynth is not on PATH; install with: brew install fluid-synth" >&2
  exit 2
fi
VERSION_LINE="$(fluidsynth --version | head -n 1)"
if [[ "$VERSION_LINE" != *"2.6.3"* ]]; then
  echo "blocked: expected FluidSynth 2.6.3, found: $VERSION_LINE" >&2
  exit 2
fi

SOURCE_SOUNDFONT="$(brew --prefix fluid-synth)/share/fluid-synth/sf2/VintageDreamsWaves-v2.sf2"
cp "$SOURCE_SOUNDFONT" "$SOUNDFONT"
shasum -a 256 -c <<< "$SOUNDFONT_SHA256  $SOUNDFONT"

python3 score.py output/score-a.mid
python3 score.py output/score-b.mid

fluidsynth -ni -F output/render-a.wav -r 48000 "$SOUNDFONT" output/score-a.mid > output/render-a.log 2>&1
fluidsynth -ni -F output/render-b.wav -r 48000 "$SOUNDFONT" output/score-a.mid > output/render-b.log 2>&1

if [[ "${1:-}" == "--record" ]]; then
  python3 render_check.py --record output/score-a.mid output/score-b.mid output/render-a.wav output/render-b.wav "$VERSION_LINE"
else
  python3 render_check.py output/score-a.mid output/score-b.mid output/render-a.wav output/render-b.wav "$VERSION_LINE"
fi
