#!/usr/bin/env bash
# Generate a tone sequence with sox synth, run a trim/fade/gain/channels/rate chain to 16-bit 44.1 kHz stereo, and measure it with soxi and stat.
# Predeclared checks (see README "Plan, before running") must all pass before the summary is recorded or diffed.
set -euo pipefail
cd "$(dirname "$0")"

TONE_FREQUENCIES_HZ=(440 660 880 1100)
SEGMENT_DURATION_S=0.5
TONE_AMPLITUDE=0.5
SOURCE_RATE_HZ=48000
TRIM_LENGTH_S=1.5
FADE_IN_S=0.02
FADE_OUT_S=0.1
GAIN_DB=-3
OUTPUT_RATE_HZ=44100
OUTPUT_CHANNELS=2
OUTPUT_BITS=16
EXPECTED_SAMPLES=66150
EXPECTED_PEAK=0.353553
PEAK_TOLERANCE=0.005
CEILING_PEAK=0.501187
FREQUENCY_TOLERANCE_PCT=1
DURATION_TOLERANCE_S=0.001
FADE_IN_HEAD_MAX=0.05
FADE_OUT_TAIL_MAX=0.02

if ! command -v sox >/dev/null || ! command -v soxi >/dev/null; then
  echo "sox-audio-chain: missing sox or soxi; install with 'brew install sox' (see README 'Plan, before running')" >&2
  exit 1
fi
mkdir -p output/segments expected
rm -f output/*.wav output/segments/*.wav output/*.png

# Source: four procedural sine tones, each a separate sox synth call, concatenated.
segmentFiles=()
for frequencyHz in "${TONE_FREQUENCIES_HZ[@]}"; do
  segmentFile="output/segments/tone-$frequencyHz.wav"
  sox -D -n -r "$SOURCE_RATE_HZ" -c 1 -b 32 "$segmentFile" synth "$SEGMENT_DURATION_S" sine "$frequencyHz" vol "$TONE_AMPLITUDE"
  segmentFiles+=("$segmentFile")
done
sox -D "${segmentFiles[@]}" -b 32 output/tones.wav

# Chain: trim, fade, gain, channels, resample to 44.1 kHz, written as 16-bit PCM. -D disables dither.
chainTo() {
  sox -D output/tones.wav -b "$OUTPUT_BITS" "$1" \
    trim 0 "$TRIM_LENGTH_S" \
    fade t "$FADE_IN_S" 0 "$FADE_OUT_S" \
    gain "$GAIN_DB" \
    channels "$OUTPUT_CHANNELS" \
    rate "$OUTPUT_RATE_HZ"
}
chainTo output/chain-a.wav
chainTo output/chain-b.wav

# Helpers: stat prints "Maximum amplitude:" and "Rough frequency:" on stderr; soxi reads header fields.
statOf() { local label="$1" file="$2"; shift 2; sox "$file" -n "$@" stat 2>&1 | awk -v key="$label" 'index($0, key) == 1 { print $NF; exit }'; }
toneRoughFrequencyOf() { sox output/tones.wav -n trim "$1" "$SEGMENT_DURATION_S" stat 2>&1 | awk '/^Rough/ && /frequency/ { print $NF; exit }'; }
isWithin() { awk -v a="$1" -v b="$2" -v tol="$3" 'BEGIN { d = a - b; if (d < 0) d = -d; exit !(d <= tol) }'; }
isAtMost() { awk -v a="$1" -v b="$2" 'BEGIN { exit !(a <= b) }'; }
isRelativeWithin() { awk -v a="$1" -v b="$2" -v pct="$3" 'BEGIN { d = a - b; if (d < 0) d = -d; exit !(d <= b * pct / 100) }'; }
sha256Of() { shasum -a 256 "$1" | awk '{ print $1 }'; }

# Source tone sequence (mono source; stat's rough frequency is unreliable on interleaved stereo).
toneFrequencyHolds=true
toneRoughFrequencies=()
for index in "${!TONE_FREQUENCIES_HZ[@]}"; do
  startS=$(awk -v i="$index" -v d="$SEGMENT_DURATION_S" 'BEGIN { printf "%.3f", i * d }')
  measuredHz=$(toneRoughFrequencyOf "$startS")
  toneRoughFrequencies+=("$measuredHz")
  if ! isRelativeWithin "$measuredHz" "${TONE_FREQUENCIES_HZ[$index]}" "$FREQUENCY_TOLERANCE_PCT"; then toneFrequencyHolds=false; fi
done

samplesA=$(soxi -s output/chain-a.wav)
rateA=$(soxi -r output/chain-a.wav)
channelsA=$(soxi -c output/chain-a.wav)
bitsA=$(soxi -b output/chain-a.wav)
durationA=$(soxi -D output/chain-a.wav)
peakA=$(statOf "Maximum amplitude:" output/chain-a.wav)
headPeak=$(statOf "Maximum amplitude:" output/chain-a.wav trim 0 0.001)
tailPeak=$(statOf "Maximum amplitude:" output/chain-a.wav trim -0.005)

sampleCountHolds=false
if [[ "$samplesA" == "$EXPECTED_SAMPLES" ]]; then sampleCountHolds=true; fi
formatHolds=false
if [[ "$rateA" == "$OUTPUT_RATE_HZ" && "$channelsA" == "$OUTPUT_CHANNELS" && "$bitsA" == "$OUTPUT_BITS" ]]; then formatHolds=true; fi
durationHolds=false
if isWithin "$durationA" "$(awk -v n="$EXPECTED_SAMPLES" -v r="$OUTPUT_RATE_HZ" 'BEGIN { printf "%.6f", n / r }')" "$DURATION_TOLERANCE_S"; then durationHolds=true; fi
ceilingHolds=false
if isAtMost "$peakA" "$CEILING_PEAK"; then ceilingHolds=true; fi
gainHolds=false
if isWithin "$peakA" "$EXPECTED_PEAK" "$PEAK_TOLERANCE"; then gainHolds=true; fi
fadeHolds=false
if isAtMost "$headPeak" "$FADE_IN_HEAD_MAX" && isAtMost "$tailPeak" "$FADE_OUT_TAIL_MAX"; then fadeHolds=true; fi

tonesHash=$(sha256Of output/tones.wav)
chainAHash=$(sha256Of output/chain-a.wav)
chainBHash=$(sha256Of output/chain-b.wav)
distinctHashesHold=false
if [[ "$tonesHash" != "$chainAHash" ]]; then distinctHashesHold=true; fi
rerunIdentical=false
if cmp -s output/chain-a.wav output/chain-b.wav && [[ "$chainAHash" == "$chainBHash" ]]; then rerunIdentical=true; fi

# Observation only, not a check and not in the summary: the same chain with dither enabled.
chainWithDitherPath=output/chain-dithered.wav
sox output/tones.wav -b "$OUTPUT_BITS" "$chainWithDitherPath" trim 0 "$TRIM_LENGTH_S" fade t "$FADE_IN_S" 0 "$FADE_OUT_S" gain "$GAIN_DB" channels "$OUTPUT_CHANNELS" rate "$OUTPUT_RATE_HZ"
echo "observation (not checked): dithered chain sha256 $(sha256Of "$chainWithDitherPath")"

# Visual aid for inspection (not a check): spectrogram of the source and of the chain output.
sox output/tones.wav -n spectrogram -o output/tones-spectrogram.png
sox output/chain-a.wav -n spectrogram -o output/chain-spectrogram.png

jq -n -S \
  --argjson trimS "$TRIM_LENGTH_S" \
  --argjson fadeInS "$FADE_IN_S" \
  --argjson fadeOutS "$FADE_OUT_S" \
  --argjson gainDb "$GAIN_DB" \
  --argjson toneRoughHz "$(printf '%s\n' "${toneRoughFrequencies[@]}" | jq -s -c 'map(tonumber)')" \
  --argjson toneHz "$(printf '%s\n' "${TONE_FREQUENCIES_HZ[@]}" | jq -s -c 'map(tonumber)')" \
  --argjson samples "$samplesA" \
  --argjson rate "$rateA" \
  --argjson channels "$channelsA" \
  --argjson bits "$bitsA" \
  --argjson durationS "$(awk -v d="$durationA" 'BEGIN { printf "%.3f", d }')" \
  --argjson peak "$(awk -v p="$peakA" 'BEGIN { printf "%.3f", p }')" \
  --argjson headPeak "$(awk -v p="$headPeak" 'BEGIN { printf "%.3f", p }')" \
  --argjson tailPeak "$(awk -v p="$tailPeak" 'BEGIN { printf "%.3f", p }')" \
  --arg tonesSha256 "$tonesHash" \
  --arg chainSha256 "$chainAHash" \
  --argjson toneFrequencyHolds "$toneFrequencyHolds" \
  --argjson sampleCountHolds "$sampleCountHolds" \
  --argjson formatHolds "$formatHolds" \
  --argjson durationHolds "$durationHolds" \
  --argjson ceilingHolds "$ceilingHolds" \
  --argjson gainHolds "$gainHolds" \
  --argjson fadeHolds "$fadeHolds" \
  --argjson distinctHashesHold "$distinctHashesHold" \
  --argjson rerunIdentical "$rerunIdentical" \
  '{
    chain: { trim_s: $trimS, fade_in_s: $fadeInS, fade_out_s: $fadeOutS, gain_db: $gainDb, channels: '"$OUTPUT_CHANNELS"', rate_hz: '"$OUTPUT_RATE_HZ"', dither: "disabled" },
    source: { tones_hz: $toneHz, tone_rough_frequency_hz: $toneRoughHz, sha256: $tonesSha256 },
    output: { samples: $samples, rate_hz: $rate, channels: $channels, bits: $bits, duration_s: $durationS, peak_amplitude: $peak, head_peak_1ms: $headPeak, tail_peak_5ms: $tailPeak, sha256: $chainSha256 },
    checks: {
      tone_sequence: $toneFrequencyHolds,
      sample_count: $sampleCountHolds,
      format: $formatHolds,
      duration: $durationHolds,
      peak_below_ceiling: $ceilingHolds,
      gain_applied: $gainHolds,
      fade_applied: $fadeHolds,
      distinct_hashes: $distinctHashesHold,
      rerun_identical: $rerunIdentical
    }
  }' > output/summary.json

if ! jq -e '.checks | all(. == true)' output/summary.json >/dev/null; then
  echo "sox-audio-chain: predeclared check failed; see output/summary.json" >&2
  cat output/summary.json >&2
  exit 1
fi

if [[ "${1:-}" == "--record" ]]; then cp output/summary.json expected/summary.json; echo "recorded expected/"; exit 0; fi
diff expected/summary.json output/summary.json && echo "sox-audio-chain: OK"
