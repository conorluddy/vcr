"""Predeclared checks for auto-editor silence cutting. Prints JSON; run from this directory."""
import json
import re
import subprocess
import xml.etree.ElementTree as ET
from pathlib import Path

OUT = Path("output")
AE = "venv/bin/auto-editor"  # relative to OUT
FPS = 30
SILENCE_FRAMES = (60, 150)  # 2.0 s to 5.0 s, from the generator in run.sh
EDIT_ARGS = ["in.mp4", "--edit", "audio:threshold=0.04", "--margin", "0sec"]


def run_in_output(command):
    return subprocess.run(command, cwd=OUT, capture_output=True, text=True, check=True)


def export_timeline(kind, name):
    run_in_output([AE, *EDIT_ARGS, "-ex", kind, "-o", name])


def probe_duration(name, stream_selector):
    result = run_in_output(["ffprobe", "-v", "error", "-select_streams", stream_selector,
                            "-show_entries", "stream=duration", "-of", "csv=p=0", name])
    return float(result.stdout.split()[0])


def detect_silence_with_ffmpeg():
    result = subprocess.run(["ffmpeg", "-hide_banner", "-i", "in.mp4", "-af",
                             "silencedetect=noise=-40dB:d=0.5", "-f", "null", "-"],
                            cwd=OUT, capture_output=True, text=True)
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", result.stderr)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", result.stderr)]
    return starts, ends


def clip_tuples(clips):
    return [(c["start"], c["dur"], c["offset"]) for c in clips]


version = run_in_output([AE, "--version"]).stdout.strip().splitlines()[-1]
export_timeline("v1", "t1.json")
export_timeline("v3", "t.v3")
export_timeline("premiere", "t.xml")
run_in_output([AE, *EDIT_ARGS, "-o", "cut.mp4"])

v1 = json.loads((OUT / "t1.json").read_text())
v3 = json.loads((OUT / "t.v3").read_text())
first_track = ET.parse(OUT / "t.xml").getroot().find(".//video/track")
xml_clips = [[int(c.findtext(k)) for k in ("start", "end", "in", "out")]
             for c in first_track.findall("clipitem")]
silence_starts, silence_ends = detect_silence_with_ffmpeg()
silence_start_frame, silence_end_frame = SILENCE_FRAMES

checks = {
    "version_29_3_1": version == "29.3.1",
    "v1_chunks_match_known_silence": v1["chunks"] == [
        [0, silence_start_frame, 1.0], [silence_start_frame, silence_end_frame, 99999.0], [silence_end_frame, 210, 1.0]],
    "v3_video_clips_skip_silence": clip_tuples(v3["v"][0]) == [(0, 60, 0), (60, 60, 150)],
    "v3_audio_clips_skip_silence": clip_tuples(v3["a"][0]) == [(0, 60, 0), (60, 60, 150)],
    "premiere_first_track_clips": xml_clips == [[0, 60, 0, 60], [60, 120, 150, 210]],
    "ffmpeg_silencedetect_agrees": (len(silence_starts) == 1 and len(silence_ends) == 1
                                    and abs(silence_starts[0] - silence_start_frame / FPS) < 0.05
                                    and abs(silence_ends[0] - silence_end_frame / FPS) < 0.05),
    "rendered_cut_is_4s": (abs(probe_duration("cut.mp4", "v") - 4.0) < 0.1
                           and abs(probe_duration("cut.mp4", "a") - 4.0) < 0.1),
}
print(json.dumps({
    "silence_span_s": [silence_start_frame / FPS, silence_end_frame / FPS],
    "v1_chunks": v1["chunks"],
    "v3_clips": clip_tuples(v3["v"][0]),
    "premiere_clips": xml_clips,
    "checks": checks,
    "all_passed": all(checks.values()),
}, indent=2))
