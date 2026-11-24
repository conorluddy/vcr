#!/usr/bin/env bash
# Generate a 440 Hz tone and a click track with ffmpeg, stretch both by 1.5 and pitch-shift the tone by +12 semitones with rubberband (R2 engine), then measure with analyse.ts and ffprobe.
# Predeclared checks (see README "Plan, before running") must all pass before the summary is recorded or diffed.
set -euo pipefail
cd "$(dirname "$0")"
REPO_ROOT="$(cd ../.. && pwd)"
TSX="$REPO_ROOT/node_modules/.bin/tsx"

SAMPLE_RATE_HZ=48000
INPUT_DURATION_S=2
TONE_HZ=440
TONE_AMPLITUDE=0.5
CLICK_HZ=1000
CLICK_AMPLITUDE=0.8
CLICK_PERIOD_S=0.25
CLICK_WIDTH_S=0.004
CLICK_PHASE_S=0.05
FIRST_CLICK_ONSET_S=0.20
CLICK_COUNT=8
STRETCH_RATIO=1.5
PITCH_SEMITONES=12
CENTS_TOLERANCE=5
SANITY_CENTS_TOLERANCE=1
SAMPLE_TOLERANCE=480
ONSET_TOLERANCE_S=0.010
INPUT_ONSET_TOLERANCE_S=0.002
INPUT_SAMPLES=$((SAMPLE_RATE_HZ * INPUT_DURATION_S))
STRETCHED_SAMPLES=$(awk -v n="$INPUT_SAMPLES" -v r="$STRETCH_RATIO" 'BEGIN { printf "%d", n * r }')
PITCHED_HZ=$(awk -v f="$TONE_HZ" -v s="$PITCH_SEMITONES" 'BEGIN { printf "%.6f", f * 2 ^ (s / 12) }')

for requiredCommand in ffmpeg ffprobe rubberband jq shasum cmp magick; do
  if ! command -v "$requiredCommand" >/dev/null; then
    echo "rubber-band-stretch: missing $requiredCommand; install rubberband with 'brew install rubberband' (see README 'Plan, before running')" >&2
    exit 1
  fi
done
if [[ ! -x "$TSX" ]]; then
  echo "rubber-band-stretch: missing $TSX; run 'pnpm install' at the repository root" >&2
  exit 1
fi
mkdir -p output expected
rm -f output/*.wav output/*.json output/*.png

# Inputs: procedural sine and a gated sine click track, both 2 s, 48 kHz mono 32-bit float.
ffmpeg -y -loglevel error -f lavfi -i "aevalsrc=${TONE_AMPLITUDE}*sin(2*PI*${TONE_HZ}*t):s=${SAMPLE_RATE_HZ}:d=${INPUT_DURATION_S}" -ac 1 -c:a pcm_f32le output/tone-440.wav
ffmpeg -y -loglevel error -f lavfi -i "aevalsrc=${CLICK_AMPLITUDE}*sin(2*PI*${CLICK_HZ}*t)*lt(mod(t+${CLICK_PHASE_S}\\,${CLICK_PERIOD_S})\\,${CLICK_WIDTH_S}):s=${SAMPLE_RATE_HZ}:d=${INPUT_DURATION_S}" -ac 1 -c:a pcm_f32le output/click-track.wav

# Routes, each run twice so that byte identity can be recorded. Engine R2 is selected with -2 explicitly.
stretch() { rubberband -2 -q -t "$STRETCH_RATIO" "$1" "$2"; }
pitchShift() { rubberband -2 -q -p "$PITCH_SEMITONES" "$1" "$2"; }
for run in a b; do
  stretch output/tone-440.wav "output/tone-stretch-$run.wav"
  stretch output/click-track.wav "output/click-stretch-$run.wav"
  pitchShift output/tone-440.wav "output/tone-pitch-$run.wav"
done

# Measurement: analyse.ts (format, samples, FFT peak, onsets) plus ffprobe's view of the sample count.
probeOf() { ffprobe -v error -select_streams a:0 -show_entries stream=codec_name,sample_rate,channels,duration_ts -of json "$1" | jq -c '.streams[0] | {codec_name, sample_rate: (.sample_rate | tonumber), channels, duration_ts}'; }
measureFile() {
  local name="$1" analysis
  analysis=$("$TSX" analyse.ts "output/$name.wav")
  jq -n --argjson analysis "$analysis" --argjson probe "$(probeOf "output/$name.wav")" '{analysis: $analysis, ffprobe: $probe}' > "output/measure-$name.json"
}
for name in tone-440 click-track tone-stretch-a tone-stretch-b click-stretch-a click-stretch-b tone-pitch-a tone-pitch-b; do
  measureFile "$name"
done

field() { jq -r "$2" "output/measure-$1.json"; }
absWithin() { awk -v a="$1" -v b="$2" -v tol="$3" 'BEGIN { d = a - b; if (d < 0) d = -d; exit !(d <= tol) }'; }
centsBetween() { awk -v a="$1" -v b="$2" 'BEGIN { printf "%.6f", 1200 * log(a / b) / log(2) }'; }
formatOf() { [[ "$(field "$1" '.analysis.sampleRateHz')" == "$SAMPLE_RATE_HZ" && "$(field "$1" '.analysis.channelCount')" == "1" ]]; }
samplesWithin() { absWithin "$(field "$1" '.analysis.samples')" "$2" "$3"; }
centsWithin() { absWithin "$(centsBetween "$(field "$1" '.analysis.fftPeakHz')" "$2")" 0 "$3"; }
probeAgrees() { jq -e '.ffprobe.duration_ts == .analysis.samples and .ffprobe.sample_rate == .analysis.sampleRateHz' "output/measure-$1.json" >/dev/null; }
# Onset k is expected at scale * (FIRST_CLICK_ONSET_S + CLICK_PERIOD_S * k): exactly CLICK_COUNT onsets, each within tolerance.
onsetsWithin() {
  jq -r '.analysis.onsetsS[]' "output/measure-$1.json" | awk -v scale="$2" -v tol="$3" -v first="$FIRST_CLICK_ONSET_S" -v period="$CLICK_PERIOD_S" -v count="$CLICK_COUNT" '
    { expected = scale * (first + period * (NR - 1)); d = $1 - expected; if (d < 0) d = -d; if (d > tol) bad = 1; n++ }
    END { ok = (!bad && n == count); exit ok ? 0 : 1 }'
}
sha256Of() { shasum -a 256 "$1" | awk '{ print $1 }'; }
sameBytes() { cmp -s "$1" "$2" && [[ "$(sha256Of "$1")" == "$(sha256Of "$2")" ]]; }

toneInputHolds=false
if formatOf tone-440 && samplesWithin tone-440 "$INPUT_SAMPLES" 0 && centsWithin tone-440 "$TONE_HZ" "$SANITY_CENTS_TOLERANCE"; then toneInputHolds=true; fi
clickInputHolds=false
if formatOf click-track && samplesWithin click-track "$INPUT_SAMPLES" 0 && onsetsWithin click-track 1 "$INPUT_ONSET_TOLERANCE_S"; then clickInputHolds=true; fi

toneStretchHolds=true
clickStretchHolds=true
tonePitchHolds=true
for run in a b; do
  if ! { formatOf "tone-stretch-$run" && samplesWithin "tone-stretch-$run" "$STRETCHED_SAMPLES" "$SAMPLE_TOLERANCE" && centsWithin "tone-stretch-$run" "$TONE_HZ" "$CENTS_TOLERANCE"; }; then toneStretchHolds=false; fi
  if ! { formatOf "click-stretch-$run" && samplesWithin "click-stretch-$run" "$STRETCHED_SAMPLES" "$SAMPLE_TOLERANCE" && onsetsWithin "click-stretch-$run" "$STRETCH_RATIO" "$ONSET_TOLERANCE_S"; }; then clickStretchHolds=false; fi
  if ! { formatOf "tone-pitch-$run" && samplesWithin "tone-pitch-$run" "$INPUT_SAMPLES" "$SAMPLE_TOLERANCE" && centsWithin "tone-pitch-$run" "$PITCHED_HZ" "$CENTS_TOLERANCE"; }; then tonePitchHolds=false; fi
done

probesAgree=true
for name in tone-440 click-track tone-stretch-a click-stretch-a tone-pitch-a; do
  if ! probeAgrees "$name"; then probesAgree=false; fi
done

toneInHash=$(sha256Of output/tone-440.wav)
clickInHash=$(sha256Of output/click-track.wav)
toneStretchHash=$(sha256Of output/tone-stretch-a.wav)
clickStretchHash=$(sha256Of output/click-stretch-a.wav)
tonePitchHash=$(sha256Of output/tone-pitch-a.wav)
distinctHashesHold=false
if [[ "$(printf '%s\n' "$toneStretchHash" "$clickStretchHash" "$tonePitchHash" | sort -u | wc -l | tr -d ' ')" == "3" ]] \
  && ! printf '%s\n' "$toneStretchHash" "$clickStretchHash" "$tonePitchHash" | grep -qx -e "$toneInHash" -e "$clickInHash"; then
  distinctHashesHold=true
fi

# Recorded, not gating: the claim says reruns are recorded either way.
toneStretchRerun=false; if sameBytes output/tone-stretch-a.wav output/tone-stretch-b.wav; then toneStretchRerun=true; fi
clickStretchRerun=false; if sameBytes output/click-stretch-a.wav output/click-stretch-b.wav; then clickStretchRerun=true; fi
tonePitchRerun=false; if sameBytes output/tone-pitch-a.wav output/tone-pitch-b.wav; then tonePitchRerun=true; fi

# Visual aid for inspection (not a check): waveforms of the inputs and the a-run outputs, stacked.
for name in tone-440 tone-stretch-a tone-pitch-a click-track click-stretch-a; do
  ffmpeg -y -loglevel error -i "output/$name.wav" -filter_complex "showwavespic=s=1200x160:split_channels=0" -frames:v 1 "output/wave-$name.png"
done
magick output/wave-tone-440.png output/wave-tone-stretch-a.png output/wave-tone-pitch-a.png output/wave-click-track.png output/wave-click-stretch-a.png -append output/contact.png

jq -n -S \
  --argjson stretchRatio "$STRETCH_RATIO" \
  --argjson pitchSemitones "$PITCH_SEMITONES" \
  --argjson toneInputHolds "$toneInputHolds" \
  --argjson clickInputHolds "$clickInputHolds" \
  --argjson toneStretchHolds "$toneStretchHolds" \
  --argjson clickStretchHolds "$clickStretchHolds" \
  --argjson tonePitchHolds "$tonePitchHolds" \
  --argjson probesAgree "$probesAgree" \
  --argjson distinctHashesHold "$distinctHashesHold" \
  --argjson toneStretchRerun "$toneStretchRerun" \
  --argjson clickStretchRerun "$clickStretchRerun" \
  --argjson tonePitchRerun "$tonePitchRerun" \
  --arg toneInHash "$toneInHash" \
  --arg clickInHash "$clickInHash" \
  --arg toneStretchHash "$toneStretchHash" \
  --arg clickStretchHash "$clickStretchHash" \
  --arg tonePitchHash "$tonePitchHash" \
  --slurpfile toneIn output/measure-tone-440.json \
  --slurpfile clickIn output/measure-click-track.json \
  --slurpfile toneStretch output/measure-tone-stretch-a.json \
  --slurpfile clickStretch output/measure-click-stretch-a.json \
  --slurpfile tonePitch output/measure-tone-pitch-a.json \
  '{
    stretch: { ratio: $stretchRatio, pitch_semitones: $pitchSemitones },
    inputs: {
      tone: { samples: $toneIn[0].analysis.samples, fft_peak_hz: $toneIn[0].analysis.fftPeakHz, sha256: $toneInHash },
      click_track: { samples: $clickIn[0].analysis.samples, onsets_s: $clickIn[0].analysis.onsetsS, sha256: $clickInHash }
    },
    outputs: {
      tone_stretch: { samples: $toneStretch[0].analysis.samples, fft_peak_hz: $toneStretch[0].analysis.fftPeakHz, sha256: $toneStretchHash },
      click_stretch: { samples: $clickStretch[0].analysis.samples, onsets_s: $clickStretch[0].analysis.onsetsS, sha256: $clickStretchHash },
      tone_pitch: { samples: $tonePitch[0].analysis.samples, fft_peak_hz: $tonePitch[0].analysis.fftPeakHz, sha256: $tonePitchHash }
    },
    rerun_identical: { tone_stretch: $toneStretchRerun, click_stretch: $clickStretchRerun, tone_pitch: $tonePitchRerun },
    checks: {
      input_tone: $toneInputHolds,
      input_clicks: $clickInputHolds,
      stretch_tone_duration_and_pitch: $toneStretchHolds,
      stretch_click_duration_and_onsets: $clickStretchHolds,
      pitch_tone_duration_and_octave: $tonePitchHolds,
      ffprobe_sample_count_agrees: $probesAgree,
      distinct_hashes: $distinctHashesHold
    }
  }' > output/summary.json

if ! jq -e '.checks | all(. == true)' output/summary.json >/dev/null; then
  echo "rubber-band-stretch: predeclared check failed; see output/summary.json" >&2
  cat output/summary.json >&2
  exit 1
fi

if [[ "${1:-}" == "--record" ]]; then cp output/summary.json expected/summary.json; echo "recorded expected/"; exit 0; fi
diff expected/summary.json output/summary.json && echo "rubber-band-stretch: OK"
