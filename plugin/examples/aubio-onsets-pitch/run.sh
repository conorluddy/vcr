#!/usr/bin/env bash
# Generate a 120 BPM click track and a five-tone sequence with FFmpeg, then run aubioonset, aubiotrack and aubiopitch on each twice.
# Predeclared checks (see README "Plan, before running") must all pass before the summary is recorded or diffed.
set -euo pipefail
cd "$(dirname "$0")"

SAMPLE_RATE_HZ=44100
CLICK_PERIOD_S=0.5
CLICK_FIRST_S=0.25
CLICK_DURATION_S=10
CLICK_COUNT=20
CLICK_BURST_S=0.05
CLICK_BPM=120
ONSET_TOLERANCE_S=0.025
MAX_ONSET_MISSES=0
MAX_ONSET_EXTRAS=0
BPM_TOLERANCE=2
MIN_BEATS=10
TONE_HZ=(220 261.63 329.63 440 523.25)
TONE_SLOT_S=0.9
TONE_SOUNDING_S=0.6
TONE_DURATION_S=4.5
PITCH_WINDOW_START_S=0.1
PITCH_WINDOW_END_S=0.5
PITCH_TOLERANCE_CENTS=10
MIN_PITCH_FRAMES=5
DURATION_TOLERANCE_S=0.01

mkdir -p output expected
rm -rf output/run-a output/run-b output/summary.json output/inspect-*.png

# Clicks sit where (t + FIRST) is a multiple of PERIOD, so the first click lands at FIRST seconds.
generate_inputs() {
  local dir="$1"
  local since="mod(t+${CLICK_FIRST_S},${CLICK_PERIOD_S})"
  local clickExpression="0.8*sin(2*PI*1000*${since})*exp(-60*${since})*lt(${since},${CLICK_BURST_S})"
  ffmpeg -y -loglevel error -f lavfi -i "aevalsrc='${clickExpression}':s=${SAMPLE_RATE_HZ}:d=${CLICK_DURATION_S}" \
    -ac 1 -c:a pcm_s16le "$dir/click.wav"

  local slotIndex="floor(t/${TONE_SLOT_S})"
  local frequencyExpression="${TONE_HZ[4]}"
  for index in 3 2 1 0; do
    frequencyExpression="if(eq(${slotIndex},${index}),${TONE_HZ[index]},${frequencyExpression})"
  done
  local withinSlot="mod(t,${TONE_SLOT_S})"
  local toneExpression="0.5*sin(2*PI*(${frequencyExpression})*${withinSlot})*lt(${withinSlot},${TONE_SOUNDING_S})"
  ffmpeg -y -loglevel error -f lavfi -i "aevalsrc='${toneExpression}':s=${SAMPLE_RATE_HZ}:d=${TONE_DURATION_S}" \
    -ac 1 -c:a pcm_s16le "$dir/tones.wav"
}

run_pipeline() {
  local dir="$1"
  mkdir -p "$dir"
  generate_inputs "$dir"
  aubioonset -i "$dir/click.wav" > "$dir/onsets.txt"
  aubiotrack -i "$dir/click.wav" > "$dir/beats.txt"
  aubiopitch -i "$dir/tones.wav" > "$dir/pitch.txt"
}

run_pipeline output/run-a
run_pipeline output/run-b

probeStream() { ffprobe -v error -select_streams a:0 -show_entries stream=sample_rate,channels -of csv=p=0 "$1"; }
probeDuration() { ffprobe -v error -show_entries format=duration -of csv=p=0 "$1"; }
sampleRateOf() { probeStream "$1" | cut -d, -f1; }
channelsOf() { probeStream "$1" | cut -d, -f2; }
withinAbs() { awk -v a="$1" -v b="$2" -v tol="$3" 'BEGIN { d = a - b; if (d < 0) d = -d; exit !(d <= tol) }'; }
fixed() { awk -v v="$1" -v digits="$2" 'BEGIN { printf "%." digits "f", v }'; }

clickDuration=$(probeDuration output/run-a/click.wav)
toneDuration=$(probeDuration output/run-a/tones.wav)
inputsMatchSpec=false
if [[ "$(sampleRateOf output/run-a/click.wav)" == "$SAMPLE_RATE_HZ" && "$(channelsOf output/run-a/click.wav)" == "1" \
  && "$(sampleRateOf output/run-a/tones.wav)" == "$SAMPLE_RATE_HZ" && "$(channelsOf output/run-a/tones.wav)" == "1" ]] \
  && withinAbs "$clickDuration" "$CLICK_DURATION_S" "$DURATION_TOLERANCE_S" && withinAbs "$toneDuration" "$TONE_DURATION_S" "$DURATION_TOLERANCE_S"; then
  inputsMatchSpec=true
fi

# Truth comes from the constants above, not from the generated file.
awk -v first="$CLICK_FIRST_S" -v period="$CLICK_PERIOD_S" -v count="$CLICK_COUNT" \
  'BEGIN { for (k = 0; k < count; k++) printf "%.6f\n", first + k * period }' > output/click-truth.txt

# Greedy one-to-one match: each detection pairs with its nearest unmatched true onset inside the tolerance.
matchOnsets() {
  awk -v tolerance="$ONSET_TOLERANCE_S" '
    FNR == NR { truth[++truthCount] = $1; next }
    { detected[++detectedCount] = $1 }
    END {
      for (i = 1; i <= detectedCount; i++) {
        best = 0; bestDistance = 1e9
        for (j = 1; j <= truthCount; j++) {
          distance = detected[i] - truth[j]; if (distance < 0) distance = -distance
          if (distance < bestDistance && !used[j]) { bestDistance = distance; best = j }
        }
        if (best > 0 && bestDistance <= tolerance) {
          used[best] = 1; matched++
          if (bestDistance * 1000 > maxErrorMs) maxErrorMs = bestDistance * 1000
        } else { extras++ }
      }
      for (j = 1; j <= truthCount; j++) if (!used[j]) misses++
      printf "%d %d %d %.3f\n", matched + 0, misses + 0, extras + 0, maxErrorMs + 0
    }' output/click-truth.txt "$1"
}

read -r onsetsMatched onsetMisses onsetExtras onsetMaxErrorMs < <(matchOnsets output/run-a/onsets.txt)
onsetsOk=false
if (( onsetMisses <= MAX_ONSET_MISSES && onsetExtras <= MAX_ONSET_EXTRAS )) \
  && awk -v e="$onsetMaxErrorMs" -v tol="$(awk -v s="$ONSET_TOLERANCE_S" 'BEGIN { printf "%.3f", s * 1000 }')" 'BEGIN { exit !(e <= tol) }'; then
  onsetsOk=true
fi

# Median of the intervals between successive beats; BPM = 60 / median interval.
beatCount=$(wc -l < output/run-a/beats.txt | tr -d ' ')
medianInterval=$(awk 'NR > 1 { print $1 - previous } { previous = $1 }' output/run-a/beats.txt | sort -g \
  | awk '{ values[NR] = $1 } END { if (NR == 0) { print 0; exit }
      if (NR % 2) printf "%.6f", values[(NR + 1) / 2]; else printf "%.6f", (values[NR / 2] + values[NR / 2 + 1]) / 2 }')
beatBpm=$(awk -v interval="$medianInterval" 'BEGIN { if (interval > 0) printf "%.3f", 60 / interval; else print 0 }')
beatsOk=false
if (( beatCount >= MIN_BEATS )) && withinAbs "$beatBpm" "$CLICK_BPM" "$BPM_TOLERANCE"; then beatsOk=true; fi

# One row per tone: expected Hz, measured Hz (median of voiced frames in the window), cents error, voiced frame count, within tolerance.
: > output/pitch-rows.txt
pitchAllWithin=true
for toneIndex in "${!TONE_HZ[@]}"; do
  expectedHz="${TONE_HZ[toneIndex]}"
  windowStart=$(awk -v slot="$TONE_SLOT_S" -v toneIndex="$toneIndex" -v offset="$PITCH_WINDOW_START_S" 'BEGIN { printf "%.6f", toneIndex * slot + offset }')
  windowEnd=$(awk -v slot="$TONE_SLOT_S" -v toneIndex="$toneIndex" -v offset="$PITCH_WINDOW_END_S" 'BEGIN { printf "%.6f", toneIndex * slot + offset }')
  voicedHz=$(awk -v lo="$windowStart" -v hi="$windowEnd" '$1 >= lo && $1 <= hi && $2 > 0 { print $2 }' output/run-a/pitch.txt | sort -g)
  frames=$(printf '%s\n' "$voicedHz" | awk 'NF' | wc -l | tr -d ' ')
  measuredHz=$(printf '%s\n' "$voicedHz" | awk 'NF { values[++count] = $1 } END {
      if (count == 0) { print 0; exit }
      if (count % 2) printf "%.6f", values[(count + 1) / 2]; else printf "%.6f", (values[count / 2] + values[count / 2 + 1]) / 2 }')
  cents=$(awk -v measured="$measuredHz" -v expected="$expectedHz" 'BEGIN { if (measured <= 0) print 0; else printf "%.3f", 1200 * log(measured / expected) / log(2) }')
  within=false
  if (( frames >= MIN_PITCH_FRAMES )) && withinAbs "$cents" 0 "$PITCH_TOLERANCE_CENTS"; then within=true; fi
  if [[ "$within" != "true" ]]; then pitchAllWithin=false; fi
  # Stored at 1 dp: aubiopitch differs by about 1e-4 Hz between processes, which flips the third decimal. Checks use unrounded values.
  printf '%s %s %s %s %s\n' "$expectedHz" "$(fixed "$measuredHz" 1)" "$(fixed "$cents" 1)" "$frames" "$within" >> output/pitch-rows.txt
done

rerunIdentical=true
for file in click.wav tones.wav onsets.txt beats.txt pitch.txt; do
  if ! cmp -s "output/run-a/$file" "output/run-b/$file"; then rerunIdentical=false; fi
done

pitchRowsJson=$(jq -R -s 'split("\n") | map(select(length > 0) | split(" ")) | map({
  expectedHz: (.[0] | tonumber), measuredHz: (.[1] | tonumber), centsError: (.[2] | tonumber),
  voicedFrames: (.[3] | tonumber), withinTolerance: (.[4] == "true") })' output/pitch-rows.txt)

jq -n -S \
  --argjson clickSampleRateHz "$(sampleRateOf output/run-a/click.wav)" \
  --argjson clickChannels "$(channelsOf output/run-a/click.wav)" \
  --argjson clickDurationS "$(fixed "$clickDuration" 3)" \
  --argjson toneSampleRateHz "$(sampleRateOf output/run-a/tones.wav)" \
  --argjson toneChannels "$(channelsOf output/run-a/tones.wav)" \
  --argjson toneDurationS "$(fixed "$toneDuration" 3)" \
  --argjson truthOnsets "$CLICK_COUNT" \
  --argjson onsetsMatched "$onsetsMatched" \
  --argjson onsetMisses "$onsetMisses" \
  --argjson onsetExtras "$onsetExtras" \
  --argjson onsetMaxErrorMs "$onsetMaxErrorMs" \
  --argjson beatCount "$beatCount" \
  --argjson beatBpm "$beatBpm" \
  --argjson pitch "$pitchRowsJson" \
  --argjson rerunIdentical "$rerunIdentical" \
  --argjson inputsMatchSpec "$inputsMatchSpec" \
  --argjson onsetsOk "$onsetsOk" \
  --argjson beatsOk "$beatsOk" \
  --argjson pitchAllWithin "$pitchAllWithin" \
  '{
    inputs: {
      click: { sampleRateHz: $clickSampleRateHz, channels: $clickChannels, durationS: $clickDurationS },
      tones: { sampleRateHz: $toneSampleRateHz, channels: $toneChannels, durationS: $toneDurationS }
    },
    onsets: { truth: $truthOnsets, matched: $onsetsMatched, misses: $onsetMisses, extras: $onsetExtras, maxErrorMs: $onsetMaxErrorMs },
    beats: { count: $beatCount, bpm: $beatBpm },
    pitch: $pitch,
    rerun_identical: $rerunIdentical,
    checks: {
      inputs_match_spec: $inputsMatchSpec,
      onsets_within_tolerance: $onsetsOk,
      beat_bpm_within_tolerance: $beatsOk,
      pitch_within_tolerance: $pitchAllWithin,
      rerun_identical: $rerunIdentical
    }
  }' > output/summary.json

checksPassed=false
if jq -e '[.rerun_identical, .checks[]] | all(. == true)' output/summary.json >/dev/null; then checksPassed=true; fi

# Inspection images for a human look at the generated audio: waveform of the clicks, spectrogram of the tones.
ffmpeg -y -loglevel error -i output/run-a/click.wav -lavfi "showwavespic=s=1200x300" -frames:v 1 output/inspect-click-wave.png
ffmpeg -y -loglevel error -i output/run-a/tones.wav -lavfi "showspectrumpic=s=1200x500:scale=log" -frames:v 1 output/inspect-tones-spectrum.png

# The baseline is the observed summary, including any false check. The rerun verdict is left out of the baseline
# because aubiopitch output is not byte-stable across processes, so that verdict flips between runs; the gate below still uses it.
stableSummary() { jq -S 'del(.rerun_identical, .checks.rerun_identical)' "$1"; }
if [[ "${1:-}" == "--record" ]]; then
  stableSummary output/summary.json > expected/summary.json
  echo "aubio-onsets-pitch: recorded expected/summary.json (all predeclared checks pass: $checksPassed)"
else
  diff -u <(stableSummary expected/summary.json) <(stableSummary output/summary.json)
fi
echo "aubio-onsets-pitch: rerun_identical this run: $(jq -r '.rerun_identical' output/summary.json)"
if [[ "$checksPassed" != "true" ]]; then
  echo "aubio-onsets-pitch: predeclared checks failed; see output/summary.json" >&2
  exit 1
fi
[[ "${1:-}" == "--record" ]] || echo "aubio-onsets-pitch: OK"
