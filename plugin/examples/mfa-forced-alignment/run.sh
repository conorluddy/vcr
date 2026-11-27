#!/usr/bin/env bash
# Forced alignment of a known 10-word transcript to macOS `say` speech with Montreal Forced Aligner 3.4.4
# (conda-forge env and english_us_arpa models under ignored output/); asserts order, monotonic timings,
# start error vs known onsets, rerun identity. --record rewrites expected/.
set -euo pipefail
cd "$(dirname "$0")"
command -v micromamba >/dev/null || { echo "micromamba is required (brew install micromamba)" >&2; exit 1; }
export MAMBA_ROOT_PREFIX="$PWD/output/mamba" MFA_ROOT_DIR="$PWD/output/mfa"
ENV="$PWD/output/env"
export PATH="$ENV/bin:$PATH"  # MFA looks up Kaldi and OpenFst binaries on PATH
VOICE="Samantha"
WORDS=(the red fox jumps over the quiet brown river today)
if [[ ! -x "$ENV/bin/mfa" ]]; then
  micromamba create -y -q -p "$ENV" -c conda-forge --override-channels "montreal-forced-aligner=3.4.4"
fi
[[ -f output/mfa/pretrained_models/acoustic/english_us_arpa.zip ]] || "$ENV/bin/mfa" model download acoustic english_us_arpa
[[ -f output/mfa/pretrained_models/dictionary/english_us_arpa.dict ]] || "$ENV/bin/mfa" model download dictionary english_us_arpa
rm -rf output/words output/corpus output/run1 output/run2 output/*.json output/*.log
mkdir -p output/words output/corpus
for index in "${!WORDS[@]}"; do
  name=$(printf '%02d' "$index")
  say -v "$VOICE" -o "output/words/$name.aiff" "${WORDS[$index]}"
  ffmpeg -y -loglevel error -i "output/words/$name.aiff" -ar 16000 -ac 1 -c:a pcm_s16le "output/words/$name.wav"
done
"$ENV/bin/python" -I build_input.py output/words output/corpus output/reference.json
for run in run1 run2; do
  "$ENV/bin/mfa" align --clean --single_speaker --output_format json --no_use_mp \
    "$PWD/output/corpus" english_us_arpa english_us_arpa "$PWD/output/$run" > "output/$run.log" 2>&1 || { cat "output/$run.log" >&2; exit 1; }
done
"$ENV/bin/python" -I check.py output/reference.json output/run1/sentence.json output/run2/sentence.json output
if [[ "${1:-}" == "--record" ]]; then
  cp output/checks.json expected/checks.json
  cp output/alignment.json expected/alignment.json
  echo "recorded expected/"
  exit 0
fi
diff expected/checks.json output/checks.json
diff expected/alignment.json output/alignment.json
echo "mfa-forced-alignment: OK"
