#!/usr/bin/env bash
# Normalise a quiet and a loud generated sine-burst WAV to an EBU R128 target with ffmpeg-normalize, then measure with FFmpeg's ebur128.
# Predeclared checks (see README "Plan, before running") must all pass before the summary is recorded or diffed.
set -euo pipefail
cd "$(dirname "$0")"
NORMALIZE=output/venv/bin/ffmpeg-normalize
TARGET_LUFS=-16.0
TARGET_TOLERANCE_LU=0.5
TRUE_PEAK_CEILING_DBTP=-1.5
CONTRAST_MIN_LU=15
LRA_MIN_LU=1.0
LRA_PRESERVED_LU=0.5
DURATION_TOLERANCE_S=0.01
SAMPLE_RATE_HZ=48000

if [[ ! -x "$NORMALIZE" ]]; then
  echo "ffmpeg-normalize-loudness: missing $NORMALIZE; see README 'Plan, before running' for the venv setup" >&2
  exit 1
fi
mkdir -p output expected output/norm-a output/norm-b output/norm-c

ffmpeg -y -loglevel error -f lavfi -i "aevalsrc='0.03*(1+mod(floor(t),2))*sin(2*PI*440*t)*lt(mod(t,1),0.5)':s=$SAMPLE_RATE_HZ:d=10:c=stereo" -c:a pcm_s16le output/quiet.wav
ffmpeg -y -loglevel error -f lavfi -i "aevalsrc='0.25*(1+mod(floor(t),2))*sin(2*PI*440*t)*lt(mod(t,1),0.5)':s=$SAMPLE_RATE_HZ:d=10:c=stereo" -c:a pcm_s16le output/loud.wav

NORMALIZE_ARGS=(-nt ebu -t "$TARGET_LUFS" -tp "$TRUE_PEAK_CEILING_DBTP" -f)
for name in quiet loud; do
  # Configuration A: default options. Only its sample rate is observed, not checked.
  "$NORMALIZE" "output/$name.wav" "${NORMALIZE_ARGS[@]}" -o "output/norm-a/$name.wav"
  # Configuration B: the claim's configuration, run twice for the rerun check.
  "$NORMALIZE" "output/$name.wav" "${NORMALIZE_ARGS[@]}" -ar "$SAMPLE_RATE_HZ" -o "output/norm-b/$name.wav"
  "$NORMALIZE" "output/$name.wav" "${NORMALIZE_ARGS[@]}" -ar "$SAMPLE_RATE_HZ" -o "output/norm-c/$name.wav"
done

# Prints "I <lufs>", "TP <dbtp>" and "LRA <lu>" from the ebur128 summary (true peak mode).
measure() {
  ffmpeg -nostats -hide_banner -i "$1" -af ebur128=peak=true -f null - 2>&1 | awk '
    /Integrated loudness:/ { mode = "I" }
    /True peak:/ { mode = "TP" }
    /Loudness range:/ { mode = "LRA" }
    mode == "I" && /I:/ { print "I", $2; mode = "" }
    mode == "TP" && /Peak:/ { print "TP", $2; mode = "" }
    mode == "LRA" && /LRA:/ { print "LRA", $2; mode = "" }'
}
valueOf() { measure "$1" | awk -v key="$2" '$1 == key { print $2 }'; }
durationOf() { ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$1" | awk '{ printf "%.3f", $1 }'; }
sampleRateOf() { ffprobe -v error -select_streams a:0 -show_entries stream=sample_rate -of default=nw=1:nk=1 "$1"; }
pcmMd5Of() { ffmpeg -nostats -loglevel error -i "$1" -map 0:a -f md5 - | sed 's/^MD5=//'; }
isWithin() { awk -v a="$1" -v b="$2" -v tol="$3" 'BEGIN { d = a - b; if (d < 0) d = -d; exit !(d <= tol) }'; }
isAtMost() { awk -v a="$1" -v b="$2" 'BEGIN { exit !(a <= b) }'; }
isAtLeast() { awk -v a="$1" -v b="$2" 'BEGIN { exit !(a >= b) }'; }
difference() { awk -v a="$1" -v b="$2" 'BEGIN { printf "%.3f", a - b }'; }
roundTo1dp() { awk -v v="$1" 'BEGIN { printf "%.1f", v }'; }

quietInputLufs=$(valueOf output/quiet.wav I)
loudInputLufs=$(valueOf output/loud.wav I)
quietInputLra=$(valueOf output/quiet.wav LRA)
loudInputLra=$(valueOf output/loud.wav LRA)
quietOutLufs=$(valueOf output/norm-b/quiet.wav I)
loudOutLufs=$(valueOf output/norm-b/loud.wav I)
quietOutTp=$(valueOf output/norm-b/quiet.wav TP)
loudOutTp=$(valueOf output/norm-b/loud.wav TP)
quietOutLra=$(valueOf output/norm-b/quiet.wav LRA)
loudOutLra=$(valueOf output/norm-b/loud.wav LRA)
quietDefaultRate=$(sampleRateOf output/norm-a/quiet.wav)
loudDefaultRate=$(sampleRateOf output/norm-a/loud.wav)
quietDefaultLufs=$(valueOf output/norm-a/quiet.wav I)
loudDefaultLufs=$(valueOf output/norm-a/loud.wav I)

contrastHolds=false
if isAtLeast "$(difference "$loudInputLufs" "$quietInputLufs")" "$CONTRAST_MIN_LU"; then contrastHolds=true; fi
inputLraHolds=false
if isAtLeast "$quietInputLra" "$LRA_MIN_LU" && isAtLeast "$loudInputLra" "$LRA_MIN_LU"; then inputLraHolds=true; fi
targetHolds=false
if isWithin "$quietOutLufs" "$TARGET_LUFS" "$TARGET_TOLERANCE_LU" && isWithin "$loudOutLufs" "$TARGET_LUFS" "$TARGET_TOLERANCE_LU"; then targetHolds=true; fi
ceilingHolds=false
if isAtMost "$quietOutTp" "$TRUE_PEAK_CEILING_DBTP" && isAtMost "$loudOutTp" "$TRUE_PEAK_CEILING_DBTP"; then ceilingHolds=true; fi
linearGainHolds=false
if isWithin "$quietOutLra" "$quietInputLra" "$LRA_PRESERVED_LU" && isWithin "$loudOutLra" "$loudInputLra" "$LRA_PRESERVED_LU"; then linearGainHolds=true; fi
durationHolds=false
if isWithin "$(durationOf output/norm-b/quiet.wav)" "$(durationOf output/quiet.wav)" "$DURATION_TOLERANCE_S" \
  && isWithin "$(durationOf output/norm-b/loud.wav)" "$(durationOf output/loud.wav)" "$DURATION_TOLERANCE_S"; then durationHolds=true; fi
sampleRateHolds=false
if [[ "$(sampleRateOf output/norm-b/quiet.wav)" == "$SAMPLE_RATE_HZ" && "$(sampleRateOf output/norm-b/loud.wav)" == "$SAMPLE_RATE_HZ" ]]; then sampleRateHolds=true; fi
quietMd5=$(pcmMd5Of output/norm-b/quiet.wav)
loudMd5=$(pcmMd5Of output/norm-b/loud.wav)
rerunIdentical=false
if [[ "$quietMd5" == "$(pcmMd5Of output/norm-c/quiet.wav)" && "$loudMd5" == "$(pcmMd5Of output/norm-c/loud.wav)" ]]; then rerunIdentical=true; fi

jq -n -S \
  --argjson quietInputLufs "$(roundTo1dp "$quietInputLufs")" \
  --argjson loudInputLufs "$(roundTo1dp "$loudInputLufs")" \
  --argjson quietInputLra "$(roundTo1dp "$quietInputLra")" \
  --argjson loudInputLra "$(roundTo1dp "$loudInputLra")" \
  --argjson quietOutLufs "$(roundTo1dp "$quietOutLufs")" \
  --argjson loudOutLufs "$(roundTo1dp "$loudOutLufs")" \
  --argjson quietOutTp "$(roundTo1dp "$quietOutTp")" \
  --argjson loudOutTp "$(roundTo1dp "$loudOutTp")" \
  --argjson quietOutLra "$(roundTo1dp "$quietOutLra")" \
  --argjson loudOutLra "$(roundTo1dp "$loudOutLra")" \
  --argjson quietInputDuration "$(durationOf output/quiet.wav)" \
  --argjson loudInputDuration "$(durationOf output/loud.wav)" \
  --argjson quietOutDuration "$(durationOf output/norm-b/quiet.wav)" \
  --argjson loudOutDuration "$(durationOf output/norm-b/loud.wav)" \
  --argjson sampleRate "$SAMPLE_RATE_HZ" \
  --argjson quietDefaultRate "$quietDefaultRate" \
  --argjson loudDefaultRate "$loudDefaultRate" \
  --argjson quietDefaultLufs "$(roundTo1dp "$quietDefaultLufs")" \
  --argjson loudDefaultLufs "$(roundTo1dp "$loudDefaultLufs")" \
  --arg quietMd5 "$quietMd5" \
  --arg loudMd5 "$loudMd5" \
  --argjson contrastHolds "$contrastHolds" \
  --argjson inputLraHolds "$inputLraHolds" \
  --argjson targetHolds "$targetHolds" \
  --argjson ceilingHolds "$ceilingHolds" \
  --argjson linearGainHolds "$linearGainHolds" \
  --argjson durationHolds "$durationHolds" \
  --argjson sampleRateHolds "$sampleRateHolds" \
  --argjson rerunIdentical "$rerunIdentical" \
  '{
    target_lufs: -16.0,
    true_peak_ceiling_dbtp: -1.5,
    inputs: {
      quiet: { integrated_lufs: $quietInputLufs, loudness_range_lu: $quietInputLra, duration_s: $quietInputDuration },
      loud: { integrated_lufs: $loudInputLufs, loudness_range_lu: $loudInputLra, duration_s: $loudInputDuration }
    },
    outputs: {
      quiet: { integrated_lufs: $quietOutLufs, true_peak_dbtp: $quietOutTp, loudness_range_lu: $quietOutLra, duration_s: $quietOutDuration, sample_rate_hz: $sampleRate, pcm_md5: $quietMd5 },
      loud: { integrated_lufs: $loudOutLufs, true_peak_dbtp: $loudOutTp, loudness_range_lu: $loudOutLra, duration_s: $loudOutDuration, sample_rate_hz: $sampleRate, pcm_md5: $loudMd5 }
    },
    default_options_observed: {
      quiet: { integrated_lufs: $quietDefaultLufs, sample_rate_hz: $quietDefaultRate },
      loud: { integrated_lufs: $loudDefaultLufs, sample_rate_hz: $loudDefaultRate }
    },
    checks: {
      input_contrast: $contrastHolds,
      input_loudness_range: $inputLraHolds,
      target_within_tolerance: $targetHolds,
      true_peak_within_ceiling: $ceilingHolds,
      linear_gain_preserves_lra: $linearGainHolds,
      duration_unchanged: $durationHolds,
      sample_rate_unchanged: $sampleRateHolds,
      rerun_identical: $rerunIdentical
    }
  }' > output/summary.json

if ! jq -e '.checks | all(. == true)' output/summary.json >/dev/null; then
  echo "ffmpeg-normalize-loudness: predeclared check failed; see output/summary.json" >&2
  cat output/summary.json >&2
  exit 1
fi

if [[ "${1:-}" == "--record" ]]; then cp output/summary.json expected/summary.json; echo "recorded expected/"; exit 0; fi
diff expected/summary.json output/summary.json && echo "ffmpeg-normalize-loudness: OK"
