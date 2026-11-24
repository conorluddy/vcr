"""Align the known lyrics to a narration with syncalong's public API and save the timings.

Usage: align_run.py NARRATION_WAV LYRICS_TXT OUT_DIR

Runs the same steps as `syncalong.align()` (lyrics prompt, Whisper transcription,
DP alignment, LRC formatting), but keeps the transcript words so the timings can
be compared with them. Writes OUT_DIR/timings.json and OUT_DIR/out.lrc.
"""
import json
import sys
from pathlib import Path

from syncalong import (
    Transcriber,
    align_lyrics_to_transcript,
    format_lrc,
    lyrics_prompt,
    parse_lyrics,
)

WHISPER_MODEL_NAME = "base"
TRANSCRIPTION_LANGUAGE = "en"


def main() -> None:
    if len(sys.argv) != 4:
        sys.exit("usage: align_run.py NARRATION_WAV LYRICS_TXT OUT_DIR")
    narration_path, lyrics_path, out_dir = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
    out_dir.mkdir(parents=True, exist_ok=True)

    lyric_lines = parse_lyrics(lyrics_path)
    transcriber = Transcriber(WHISPER_MODEL_NAME)
    transcript_words = transcriber.transcribe(
        narration_path,
        language=TRANSCRIPTION_LANGUAGE,
        initial_prompt=lyrics_prompt(lyric_lines),
    )
    timed_lines = align_lyrics_to_transcript(lyric_lines, transcript_words)

    (out_dir / "out.lrc").write_text(format_lrc(timed_lines), encoding="utf-8")
    report = {
        "lines": [
            {"index": line.index, "raw": line.raw, "start": start}
            for line, start in timed_lines
        ],
        "transcript_words": [word.to_dict() for word in transcript_words],
    }
    (out_dir / "timings.json").write_text(
        json.dumps(report, indent=2, sort_keys=True) + "\n", encoding="utf-8"
    )


if __name__ == "__main__":
    main()
