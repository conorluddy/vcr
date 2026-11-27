#!/usr/bin/env bash
# MP4Box (GPAC) packages a generated ffmpeg MP4 as DASH/CMAF-style fragments, adds a WebVTT track and chapters.
# Predeclared checks live in expected/checks.json (hand-written). Determinism is measured over two full runs;
# files that differ are compared with expected/known-fail.json (KNOWN FAIL, exit 0 only while it reproduces).
set -euo pipefail
cd "$(dirname "$0")"
for tool in MP4Box ffmpeg ffprobe jq; do
  command -v "$tool" >/dev/null || { echo "gpac-cmaf-dash: $tool not found on PATH (install GPAC with: brew install gpac; ffmpeg with: brew install ffmpeg)" >&2; exit 1; }
done
FIXED_TIME='1/1/2020-0:0:0'
rm -rf output; mkdir -p output

build_run() { # $1 = run directory
  local dir=$1; mkdir -p "$dir"
  ffmpeg -v error -y -f lavfi -i testsrc=size=320x180:rate=25:duration=10 -f lavfi -i sine=frequency=440:duration=10 \
    -c:v libx264 -preset veryfast -g 25 -keyint_min 25 -sc_threshold 0 -pix_fmt yuv420p -c:a aac -b:a 64k -shortest \
    -fflags +bitexact -flags:v +bitexact -flags:a +bitexact "$dir/src.mp4"
  MP4Box -quiet -add "$dir/src.mp4" -add input/subs.vtt:lang=en -chap input/chapters.txt \
    -time "$FIXED_TIME" -time 1="$FIXED_TIME" -time 2="$FIXED_TIME" -time 3="$FIXED_TIME" \
    -mtime 1="$FIXED_TIME" -mtime 2="$FIXED_TIME" -mtime 3="$FIXED_TIME" -new "$dir/base.mp4" >/dev/null 2>&1
  # MP4Box -dash with three inputs aborts (SIGABRT/SIGTRAP) in roughly one run in five on this machine; retry from a clean directory
  local attempt
  for attempt in 1 2 3 4 5 6 7 8; do
    rm -f "$dir"/seg_* "$dir"/manifest.mpd
    if (cd "$dir" && MP4Box -quiet -dash 4000 -frag 4000 -rap -profile live -segment-name 'seg_$RepresentationID$_$Number$' \
        -out manifest.mpd base.mp4#video:id=v base.mp4#audio:id=a base.mp4#trackID=3:id=t >/dev/null 2>&1); then break; fi
    echo "gpac-cmaf-dash: MP4Box -dash crashed (attempt $attempt), retrying" >&2
    [[ $attempt -lt 8 ]] || { echo "gpac-cmaf-dash: MP4Box -dash crashed 8 times" >&2; return 1; }
  done
  # the MPD carries a generation timestamp comment; drop it so the rest can be compared
  sed -i.bak '/MPD file Generated/d' "$dir/manifest.mpd" && rm "$dir/manifest.mpd.bak"
}

summarise() { # $1 = run directory -> JSON on stdout
  local dir=$1 rep i
  local info; info=$(MP4Box -quiet -info "$dir/base.mp4" 2>&1)
  local streams; streams=$(ffprobe -v error -show_entries stream=codec_name,codec_type -of csv=p=0 "$dir/base.mp4" | paste -sd' ' -)
  local segs='{}'
  for rep in v a t; do
    local counts=() ends=()
    for i in 1 2 3; do
      cat "$dir/seg_${rep}_.mp4" "$dir/seg_${rep}_$i.m4s" > "$dir/join.mp4"
      counts+=("$(ffprobe -v error -select_streams 0 -show_entries packet=pts -of csv=p=0 "$dir/join.mp4" | wc -l | tr -d ' ')")
      ends+=("$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$dir/join.mp4" | awk '{printf "%.1f", $1}')")
    done
    segs=$(jq -c --arg r "$rep" --argjson c "$(printf '%s\n' "${counts[@]}" | jq -s -c .)" --argjson e "$(printf '%s\n' "${ends[@]}" | jq -s -c .)" '. + {($r): {packetsPerSegment: $c, cumulativeEndSeconds: $e}}' <<<"$segs")
  done
  rm -f "$dir/join.mp4"
  jq -S -n --arg streams "$streams" --argjson segs "$segs" \
    --arg trackTypes "$(grep -E '^Media Type:' <<<"$info" | sed 's/Media Type: //' | paste -sd' ' -)" \
    --arg language "$(grep -E 'Media Language' <<<"$info" | sed 's/.*(\(...\))/\1/')" \
    --arg chapters "$(grep -E '^[[:space:]]+#[0-9]+ - ' <<<"$info" | sed -E 's/^[[:space:]]+#[0-9]+ - //' | paste -sd'|' -)" \
    --arg movieDuration "$(grep -E '^Duration' <<<"$info" | head -1 | sed 's/Duration //')" \
    --arg segmentFiles "$(cd "$dir" && ls seg_*.m4s | wc -l | tr -d ' ')" \
    --arg maxSegmentDuration "$(grep -o 'maxSegmentDuration="[^"]*"' "$dir/manifest.mpd" | cut -d'"' -f2)" \
    --arg presentationDuration "$(grep -o 'mediaPresentationDuration="[^"]*"' "$dir/manifest.mpd" | cut -d'"' -f2)" \
    --arg adaptationSets "$(grep -c '<AdaptationSet' "$dir/manifest.mpd")" \
    '{ffprobeStreams: $streams, mp4boxTrackTypes: $trackTypes, textLanguage: $language, chapters: $chapters, movieDuration: $movieDuration,
      mediaSegmentFiles: ($segmentFiles|tonumber), adaptationSets: ($adaptationSets|tonumber), maxSegmentDuration: $maxSegmentDuration,
      mediaPresentationDuration: $presentationDuration, segments: $segs}'
}

build_run output/run1; sleep 2; build_run output/run2  # the gap makes a wall-clock modification time show up
summarise output/run1 > output/checks.json
summarise output/run2 > output/checks.run2.json
cmp -s output/checks.json output/checks.run2.json || { echo "gpac-cmaf-dash: structural summaries differ between runs" >&2; exit 1; }
diff <(jq -S . expected/checks.json) output/checks.json || { echo "gpac-cmaf-dash: summary differs from expected/checks.json" >&2; exit 1; }

differing=()
for f in $(cd output/run1 && ls); do
  cmp -s "output/run1/$f" "output/run2/$f" || differing+=("$f")
done
printf '%s\n' "${differing[@]+"${differing[@]}"}" | jq -R -s -c 'split("\n") | map(select(length>0))' > output/differing.json
if [[ $(cat output/differing.json) == "[]" ]]; then
  echo "gpac-cmaf-dash: byte-identical across two runs"
elif diff <(jq -S . expected/known-fail.json) <(jq -S . output/differing.json) >/dev/null; then
  echo "KNOWN FAIL: not byte-identical across runs (MP4 timestamps); differing files: $(cat output/differing.json)"
else
  echo "gpac-cmaf-dash: differing files changed from expected/known-fail.json: $(cat output/differing.json)" >&2; exit 1
fi
echo "gpac-cmaf-dash: OK ($(MP4Box -version 2>&1 | head -1))"
