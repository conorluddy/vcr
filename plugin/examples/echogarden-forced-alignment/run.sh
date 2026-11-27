#!/usr/bin/env bash
# Forced alignment of a known 10-word transcript to macOS `say` speech with Echogarden's DTW engine;
# asserts word order, monotonic timings, start error vs known onsets, rerun identity. --record rewrites expected/.
set -euo pipefail
cd "$(dirname "$0")"
[[ -d node_modules/echogarden ]] || { echo "run pnpm install at the repository root first" >&2; exit 1; }
export XDG_CACHE_HOME="$PWD/output/cache"
VOICE="Samantha"
WORDS=(the red fox jumps over the quiet brown river today)
rm -rf output/words output/*.json output/*.wav output/*.log
mkdir -p output/words
for index in "${!WORDS[@]}"; do
  name=$(printf '%02d' "$index")
  say -v "$VOICE" -o "output/words/$name.aiff" "${WORDS[$index]}"
  ffmpeg -y -loglevel error -i "output/words/$name.aiff" -ar 16000 -ac 1 -c:a pcm_s16le "output/words/$name.wav"
done
node align.mjs output/words output > output/align.log 2>&1 || { cat output/align.log >&2; exit 1; }
grep KNOWN output/align.log >&2 || true
if [[ "${1:-}" == "--record" ]]; then
  cp output/checks.json expected/checks.json
  cp output/alignment.json expected/alignment.json
  echo "recorded expected/"
  exit 0
fi
diff expected/checks.json output/checks.json
diff expected/alignment.json output/alignment.json
echo "echogarden-forced-alignment: OK"
