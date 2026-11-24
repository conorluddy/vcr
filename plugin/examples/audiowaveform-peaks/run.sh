#!/usr/bin/env bash
# Generate a 3 s envelope with sox (silence, -6 dBFS and -20 dBFS 1 kHz sines), run audiowaveform to JSON, DAT and PNG twice, and check the peaks against the envelope.
# Predeclared checks (see README "Plan, before running") must all pass before the summary is recorded or diffed.
set -euo pipefail
cd "$(dirname "$0")"

SAMPLE_RATE_HZ=48000
TONE_FREQUENCY_HZ=1000
SEGMENT_DURATION_S=1
SEGMENT_NAMES=(silence minus-6-dbfs minus-20-dbfs)
SEGMENT_AMPLITUDES=(0 0.501187 0.1)
MINUS_6_AMPLITUDE=0.501187
MINUS_20_AMPLITUDE=0.1
SAMPLES_PER_PIXEL=480
BITS=16
PIXELS_PER_SEGMENT=100
PNG_WIDTH=300
PNG_HEIGHT=200
EXPECTED_LENGTH=300
EXPECTED_DATA_VALUES=600
EXPECTED_DAT_BYTES=1220
FULL_SCALE=32768
ZERO_TOLERANCE=0.001
AMPLITUDE_TOLERANCE=0.01

for requiredTool in audiowaveform sox magick jq shasum sips; do
  if ! command -v "$requiredTool" >/dev/null; then
    echo "audiowaveform-peaks: missing $requiredTool; install audiowaveform with 'brew install audiowaveform' (sox, ImageMagick: see README 'Plan, before running')" >&2
    exit 1
  fi
done
mkdir -p output/segments output/rerun expected
rm -f output/*.wav output/*.json output/*.dat output/*.png output/segments/*.wav output/rerun/*

# Source: three 1 s sine segments from separate sox synth calls, concatenated and written as 16-bit with -D (no dither).
segmentFiles=()
for index in "${!SEGMENT_NAMES[@]}"; do
  segmentFile="output/segments/${SEGMENT_NAMES[$index]}.wav"
  sox -D -n -r "$SAMPLE_RATE_HZ" -c 1 -b 32 "$segmentFile" synth "$SEGMENT_DURATION_S" sine "$TONE_FREQUENCY_HZ" vol "${SEGMENT_AMPLITUDES[$index]}"
  segmentFiles+=("$segmentFile")
done
sox -D "${segmentFiles[@]}" -b "$BITS" output/envelope.wav

# audiowaveform: the primary run and an identical rerun, each as JSON, DAT and PNG.
makeWaveforms() {
  local directory="$1"
  audiowaveform -q -i output/envelope.wav -o "$directory/envelope.json" -z "$SAMPLES_PER_PIXEL" -b "$BITS" --output-format json
  audiowaveform -q -i output/envelope.wav -o "$directory/envelope.dat" -z "$SAMPLES_PER_PIXEL" -b "$BITS" --output-format dat
  audiowaveform -q -i output/envelope.wav -o "$directory/envelope.png" -z "$SAMPLES_PER_PIXEL" -b "$BITS" \
    -w "$PNG_WIDTH" -h "$PNG_HEIGHT" --no-axis-labels --background-color 00000000 --output-format png
}
makeWaveforms output
makeWaveforms output/rerun

sha256Of() { shasum -a 256 "$1" | awk '{ print $1 }'; }

rerunIdentical=false
if cmp -s output/envelope.json output/rerun/envelope.json && cmp -s output/envelope.dat output/rerun/envelope.dat && cmp -s output/envelope.png output/rerun/envelope.png; then
  rerunIdentical=true
fi

# DAT header: five little-endian int32 (version, flags, sample rate, samples per pixel, length); then int16 min/max pairs.
read -r -a datHeaderFields <<< "$(od -An -t d4 -N 20 output/envelope.dat | tr '\n' ' ')"
datVersion=${datHeaderFields[0]}
datFlags=${datHeaderFields[1]}
datSampleRate=${datHeaderFields[2]}
datSamplesPerPixel=${datHeaderFields[3]}
datLength=${datHeaderFields[4]}
datBytes=$(wc -c < output/envelope.dat | tr -d ' ')
datValues=$(od -An -t d2 -j 20 -v output/envelope.dat | tr -s ' ' '\n' | sed '/^$/d' | jq -s -c '.')

# PNG: size and format from sips; alpha extrema from ImageMagick, scaled to 0-255.
pngWidth=$(sips -g pixelWidth output/envelope.png | awk '/pixelWidth/ { print $2 }')
pngHeight=$(sips -g pixelHeight output/envelope.png | awk '/pixelHeight/ { print $2 }')
pngFormat=$(sips -g format output/envelope.png | awk '/format/ { print $2 }')
read -r alphaMinRaw alphaMaxRaw <<< "$(magick output/envelope.png -alpha extract -format '%[fx:255*minima] %[fx:255*maxima]' info:)"
alphaMin=$(awk -v v="$alphaMinRaw" 'BEGIN { printf "%d", v + 0.5 }')
alphaMax=$(awk -v v="$alphaMaxRaw" 'BEGIN { printf "%d", v + 0.5 }')

artifacts=$(jq -n -c \
  --argjson datVersion "$datVersion" \
  --argjson datFlags "$datFlags" \
  --argjson datSampleRate "$datSampleRate" \
  --argjson datSamplesPerPixel "$datSamplesPerPixel" \
  --argjson datLength "$datLength" \
  --argjson datBytes "$datBytes" \
  --argjson datValues "$datValues" \
  --argjson pngWidth "$pngWidth" \
  --argjson pngHeight "$pngHeight" \
  --arg pngFormat "$pngFormat" \
  --argjson alphaMin "$alphaMin" \
  --argjson alphaMax "$alphaMax" \
  --arg inputSha256 "$(sha256Of output/envelope.wav)" \
  --arg jsonSha256 "$(sha256Of output/envelope.json)" \
  --arg datSha256 "$(sha256Of output/envelope.dat)" \
  --arg pngSha256 "$(sha256Of output/envelope.png)" \
  --argjson rerunIdentical "$rerunIdentical" \
  '{
    dat: { version: $datVersion, flags: $datFlags, sample_rate: $datSampleRate, samples_per_pixel: $datSamplesPerPixel, length: $datLength, bytes: $datBytes, values: $datValues },
    png: { width: $pngWidth, height: $pngHeight, format: $pngFormat, alpha_min: $alphaMin, alpha_max: $alphaMax },
    sha256: { input: $inputSha256, json: $jsonSha256, dat: $datSha256, png: $pngSha256 },
    rerun_identical: $rerunIdentical
  }')

jq -S \
  --argjson artifacts "$artifacts" \
  --argjson fullScale "$FULL_SCALE" \
  --argjson pixelsPerSegment "$PIXELS_PER_SEGMENT" \
  --argjson zeroTolerance "$ZERO_TOLERANCE" \
  --argjson amplitudeTolerance "$AMPLITUDE_TOLERANCE" \
  --argjson minus6Amplitude "$MINUS_6_AMPLITUDE" \
  --argjson minus20Amplitude "$MINUS_20_AMPLITUDE" \
  --argjson expectedLength "$EXPECTED_LENGTH" \
  --argjson samplesPerPixel "$SAMPLES_PER_PIXEL" \
  --argjson sampleRate "$SAMPLE_RATE_HZ" \
  --argjson bits "$BITS" \
  --argjson expectedDataValues "$EXPECTED_DATA_VALUES" \
  --argjson expectedDatBytes "$EXPECTED_DAT_BYTES" \
  --argjson pngWidth "$PNG_WIDTH" \
  --argjson pngHeight "$PNG_HEIGHT" \
  -f analyse-peaks.jq output/envelope.json > output/summary.json

if ! jq -e '.checks | all(. == true)' output/summary.json >/dev/null; then
  echo "audiowaveform-peaks: predeclared check failed; see output/summary.json" >&2
  cat output/summary.json >&2
  exit 1
fi

# Observation only (not a check): contact sheet of the PNG on grey, for Read.
magick output/envelope.png -background '#808080' -flatten -resize 200% output/contact.png

if [[ "${1:-}" == "--record" ]]; then cp output/summary.json expected/summary.json; echo "recorded expected/"; exit 0; fi
diff expected/summary.json output/summary.json && echo "audiowaveform-peaks: OK"
