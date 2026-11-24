"""Compare syncalong line timings with the ground truth of the generated narration.

Usage: check.py CLIPS_TSV LYRICS_TXT LEAD_SECONDS GAP_SECONDS RUN_DIR RERUN_DIR
Prints JSON to stdout and exits 1 when any gating check fails.
Ground truth: line k starts at LEAD + sum(durations of lines before k) + k * GAP,
where durations are the measured lengths of the trimmed narration clips.
Plain Python only.
"""
import hashlib
import json
import re
import sys
from pathlib import Path

TOLERANCE_SECONDS = 0.5
LRC_LINE_PATTERN = re.compile(r"^\[(\d{2}):(\d{2}\.\d{2})\] (.*)$")
START_EQUALITY_EPSILON = 1e-9


def read_clip_durations(clips_path):
    durations = []
    for row in clips_path.read_text(encoding="utf-8").splitlines():
        name, seconds = row.split("\t")
        durations.append(float(seconds))
    return durations


def ground_truth_starts(durations, lead_seconds, gap_seconds):
    starts = [lead_seconds]
    for duration in durations[:-1]:
        starts.append(starts[-1] + duration + gap_seconds)
    return starts


def read_run(run_dir):
    timings = json.loads((run_dir / "timings.json").read_text(encoding="utf-8"))
    lrc_bytes = (run_dir / "out.lrc").read_bytes()
    return timings, lrc_bytes


def lrc_texts(lrc_bytes):
    texts = []
    for line in lrc_bytes.decode("utf-8").splitlines():
        match = LRC_LINE_PATTERN.match(line)
        texts.append(match.group(3) if match else None)
    return texts


def sha256_hex(data):
    return hashlib.sha256(data).hexdigest()


def measure(clips_path, lyrics_path, lead_seconds, gap_seconds, run_dir, rerun_dir):
    durations = read_clip_durations(clips_path)
    truths = ground_truth_starts(durations, lead_seconds, gap_seconds)
    lyric_lines = [line for line in lyrics_path.read_text(encoding="utf-8").splitlines() if line.strip()]
    timings, lrc_bytes = read_run(run_dir)
    rerun_timings, rerun_lrc_bytes = read_run(rerun_dir)

    starts = [line["start"] for line in timings["lines"]]
    timed_starts = [start for start in starts if start is not None]
    word_starts = [word["start"] for word in timings["transcript_words"]]
    errors = [abs(start - truth) for start, truth in zip(starts, truths) if start is not None]
    texts = lrc_texts(lrc_bytes)

    checks = {
        "one_segment_per_lyric_line": len(starts) == len(lyric_lines) == len(truths),
        "every_line_timed": len(timed_starts) == len(starts),
        "starts_are_transcript_word_starts": all(
            any(abs(start - word_start) < START_EQUALITY_EPSILON for word_start in word_starts)
            for start in timed_starts
        ),
        "starts_in_order": all(later > earlier for earlier, later in zip(timed_starts, timed_starts[1:])),
        "lrc_covers_full_text": texts == [line.strip() for line in lyric_lines],
        "starts_within_tolerance": len(errors) == len(truths) and max(errors) <= TOLERANCE_SECONDS,
        "rerun_lrc_byte_identical": rerun_lrc_bytes == lrc_bytes,
        "rerun_timings_identical": rerun_timings == timings,
    }
    return {
        "measurements": {
            "line_count": len(starts),
            "transcript_word_count": len(word_starts),
            "ground_truth_starts_seconds": [round(value, 3) for value in truths],
            "syncalong_starts_seconds": [None if s is None else round(s, 3) for s in starts],
            "max_abs_error_seconds": round(max(errors), 3) if errors else None,
            "tolerance_seconds": TOLERANCE_SECONDS,
            "lrc_sha256": sha256_hex(lrc_bytes),
            "rerun_lrc_sha256": sha256_hex(rerun_lrc_bytes),
        },
        "checks": checks,
    }


def main():
    if len(sys.argv) != 7:
        sys.exit("usage: check.py CLIPS_TSV LYRICS_TXT LEAD_SECONDS GAP_SECONDS RUN_DIR RERUN_DIR")
    report = measure(
        Path(sys.argv[1]),
        Path(sys.argv[2]),
        float(sys.argv[3]),
        float(sys.argv[4]),
        Path(sys.argv[5]),
        Path(sys.argv[6]),
    )
    print(json.dumps(report, indent=2, sort_keys=True))
    if not all(report["checks"].values()):
        sys.exit(1)


if __name__ == "__main__":
    main()
