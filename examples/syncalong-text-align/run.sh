#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
OUT="$PWD/output"
PYTHON="$OUT/venv/bin/python"
[[ -x "$PYTHON" ]] || { echo "Create output/venv with syncalong==2.0.1 and its whisper extra as in README.md; no automatic install." >&2; exit 1; }

# Caches stay under output/: Whisper reads ~/.cache/whisper, so HOME is redirected for this run only.
export HOME="$OUT/home"
export XDG_CACHE_HOME="$OUT/cache"
export HF_HOME="$OUT/cache/huggingface"
export TORCH_HOME="$OUT/cache/torch"
mkdir -p "$HOME"

VOICE="Samantha"
LEAD_SECONDS="1.0"
GAP_SECONDS="1.5"
NARRATION="$OUT/narration"
rm -rf "$NARRATION"
mkdir -p "$NARRATION"

ffmpeg_quiet() { ffmpeg -hide_banner -loglevel error -y "$@"; }

# Silence clips share the narration format (16 kHz mono PCM) so the concat demuxer can copy them.
ffmpeg_quiet -f lavfi -i "anullsrc=r=16000:cl=mono" -t "$LEAD_SECONDS" -c:a pcm_s16le "$NARRATION/lead.wav"
ffmpeg_quiet -f lavfi -i "anullsrc=r=16000:cl=mono" -t "$GAP_SECONDS" -c:a pcm_s16le "$NARRATION/gap.wav"

CONCAT_LIST="$NARRATION/concat.txt"
echo "file 'lead.wav'" > "$CONCAT_LIST"
LINE_COUNT=0
CLIP_TABLE="$NARRATION/clips.tsv"
: > "$CLIP_TABLE"
while IFS= read -r line || [[ -n "$line" ]]; do
  [[ -n "$line" ]] || continue
  LINE_COUNT=$((LINE_COUNT + 1))
  NAME=$(printf "line-%02d" "$LINE_COUNT")
  say -v "$VOICE" --file-format=WAVE --data-format=LEI16@16000 -o "$NARRATION/$NAME.say.wav" "$line"
  # Trim leading silence so each clip starts at speech onset; ground truth is then the clip start.
  ffmpeg_quiet -i "$NARRATION/$NAME.say.wav" -af "silenceremove=start_periods=1:start_threshold=-45dB" -ar 16000 -ac 1 -c:a pcm_s16le "$NARRATION/$NAME.wav"
  DURATION=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$NARRATION/$NAME.wav")
  printf "%s\t%s\n" "$NAME" "$DURATION" >> "$CLIP_TABLE"
  if [[ "$LINE_COUNT" -gt 1 ]]; then echo "file 'gap.wav'" >> "$CONCAT_LIST"; fi
  echo "file '$NAME.wav'" >> "$CONCAT_LIST"
done < lyrics.txt

ffmpeg_quiet -f concat -safe 0 -i "$CONCAT_LIST" -c copy "$NARRATION/narration.wav"
rm -f "$NARRATION"/*.say.wav

"$PYTHON" -m pip --disable-pip-version-check freeze > "$OUT/dependencies.txt"
"$PYTHON" align_run.py "$NARRATION/narration.wav" lyrics.txt "$OUT/run" > "$OUT/align.log" 2>&1 || { cat "$OUT/align.log" >&2; exit 1; }
"$PYTHON" align_run.py "$NARRATION/narration.wav" lyrics.txt "$OUT/rerun" > "$OUT/align-rerun.log" 2>&1 || { cat "$OUT/align-rerun.log" >&2; exit 1; }
"$PYTHON" check.py "$NARRATION/clips.tsv" lyrics.txt "$LEAD_SECONDS" "$GAP_SECONDS" "$OUT/run" "$OUT/rerun" > "$OUT/checks.json" || { cat "$OUT/checks.json" >&2; exit 1; }

if [[ "${1:-}" == "--record" ]]; then cp "$OUT/checks.json" expected/checks.json; echo "recorded expected/"; exit 0; fi
diff expected/checks.json "$OUT/checks.json" && echo "syncalong-text-align: OK"
