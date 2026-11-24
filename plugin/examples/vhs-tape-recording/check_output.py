#!/usr/bin/env python3
import glob
import hashlib
import json
import os
import re
import subprocess
import sys


NOMINAL_DURATION_SECONDS = 3.9
DURATION_TOLERANCE_SECONDS = 1.0
NOMINAL_FRAME_COUNT = 39
FRAME_COUNT_TOLERANCE = 10
EXPECTED_VIDEO_WIDTH = 640
EXPECTED_VIDEO_HEIGHT = 360
MINIMUM_FIRST_LAST_DIFFERENT_PIXELS = 1000


def run_capture(arguments: list[str]) -> str:
    completed = subprocess.run(arguments, check=False, capture_output=True, text=True)
    return completed.stdout + completed.stderr


def sha256_of_file(path: str) -> str:
    with open(path, "rb") as handle:
        return hashlib.sha256(handle.read()).hexdigest()


def probe_mp4(mp4_path: str) -> dict:
    output = run_capture([
        "ffprobe", "-v", "error", "-count_frames", "-select_streams", "v:0",
        "-show_entries", "stream=codec_name,width,height,nb_read_frames",
        "-show_entries", "format=duration", "-of", "json", mp4_path,
    ])
    return json.loads(output)


def image_dimensions(image_path: str) -> tuple[int, int]:
    width, height = run_capture(["magick", "identify", "-format", "%w %h", image_path]).split()
    return int(width), int(height)


def differing_pixel_count(first_path: str, second_path: str) -> int:
    output = run_capture(["magick", "compare", "-metric", "AE", first_path, second_path, "null:"])
    match = re.search(r"\d+", output)
    if match is None:
        raise SystemExit(f"vhs-tape-recording: could not read pixel difference from: {output!r}")
    return int(match.group(0))


def read_text(path: str) -> str:
    with open(path, encoding="utf-8") as handle:
        return handle.read().strip()


output_dir, vhs_version_path, chrome_version_path, ffprobe_version_path, imagemagick_version_path = sys.argv[1:6]
mp4_path = os.path.join(output_dir, "demo.mp4")
golden_path = os.path.join(output_dir, "golden.txt")
frame_paths = sorted(glob.glob(os.path.join(output_dir, "frames", "*.png")))

outputs_present = os.path.isfile(mp4_path) and os.path.isfile(golden_path) and len(frame_paths) > 0
failures: list[str] = []


def check(name: str, passed: bool, observed: object) -> None:
    print(f"{'PASS' if passed else 'FAIL'} {name}: {observed}")
    if not passed:
        failures.append(name)


check("outputs present (mp4, golden text, PNG frames)", outputs_present, len(frame_paths))
if not outputs_present:
    raise SystemExit("vhs-tape-recording: vhs did not write every predeclared output")

mp4_probe = probe_mp4(mp4_path)
stream = mp4_probe["streams"][0]
mp4_width = int(stream["width"])
mp4_height = int(stream["height"])
mp4_frame_count = int(stream["nb_read_frames"])
mp4_duration = float(mp4_probe["format"]["duration"])
check("mp4 is h264 at 640x360", stream["codec_name"] == "h264" and (mp4_width, mp4_height) == (EXPECTED_VIDEO_WIDTH, EXPECTED_VIDEO_HEIGHT),
      f"{stream['codec_name']} {mp4_width}x{mp4_height}")

first_dimensions = image_dimensions(frame_paths[0])
last_dimensions = image_dimensions(frame_paths[-1])
check("first and last PNG are 640x360", first_dimensions == (EXPECTED_VIDEO_WIDTH, EXPECTED_VIDEO_HEIGHT)
      and last_dimensions == (EXPECTED_VIDEO_WIDTH, EXPECTED_VIDEO_HEIGHT), f"first {first_dimensions}, last {last_dimensions}")

png_frame_count = len(frame_paths)
check("PNG frame count within 39 +/- 10", abs(png_frame_count - NOMINAL_FRAME_COUNT) <= FRAME_COUNT_TOLERANCE, png_frame_count)
check("MP4 frame count within 39 +/- 10", abs(mp4_frame_count - NOMINAL_FRAME_COUNT) <= FRAME_COUNT_TOLERANCE, mp4_frame_count)
check("MP4 duration within 3.9 +/- 1.0 s", abs(mp4_duration - NOMINAL_DURATION_SECONDS) <= DURATION_TOLERANCE_SECONDS, round(mp4_duration, 3))

golden_text = read_text(golden_path) if os.path.isfile(golden_path) else ""
golden_has_commands = "echo alpha" in golden_text and "echo beta" in golden_text
golden_has_outputs = golden_text.count("alpha") >= 2 and golden_text.count("beta") >= 2
check("golden text has both typed commands and their output", golden_has_commands and golden_has_outputs,
      f"commands={golden_has_commands} outputs={golden_has_outputs}")

first_last_pixels = differing_pixel_count(frame_paths[0], frame_paths[-1])
check("first and last PNG differ by at least 1000 pixels", first_last_pixels >= MINIMUM_FIRST_LAST_DIFFERENT_PIXELS, first_last_pixels)

frame_hash_lines = [f"{sha256_of_file(frame_path)}  {os.path.basename(frame_path)}" for frame_path in frame_paths]
frames_manifest_path = os.path.join(output_dir, "frames.sha256")
with open(frames_manifest_path, "w", encoding="utf-8") as handle:
    handle.write("\n".join(frame_hash_lines) + "\n")

metrics = {
    "vhs_version": read_text(vhs_version_path),
    "chrome_version": read_text(chrome_version_path),
    "ffprobe_version": read_text(ffprobe_version_path),
    "imagemagick_version": read_text(imagemagick_version_path),
    "mp4_codec": stream["codec_name"],
    "mp4_width": mp4_width,
    "mp4_height": mp4_height,
    "png_first_dimensions": list(first_dimensions),
    "png_last_dimensions": list(last_dimensions),
    "predeclared_checks_passed": not failures,
    "failed_checks": failures,
    "golden_text_sha256": sha256_of_file(golden_path),
}
observed = {
    "png_frame_count": png_frame_count,
    "png_frame_families": sorted({os.path.basename(path).rsplit("-", 1)[0] for path in frame_paths}),
    "mp4_frame_count": mp4_frame_count,
    "mp4_duration_seconds": round(mp4_duration, 6),
    "first_last_different_pixels": first_last_pixels,
    "mp4_sha256": sha256_of_file(mp4_path),
    "png_manifest_sha256": sha256_of_file(frames_manifest_path),
}
with open(os.path.join(output_dir, "metrics.json"), "w", encoding="utf-8") as handle:
    json.dump(metrics, handle, indent=2, sort_keys=True)
    handle.write("\n")
with open(os.path.join(output_dir, "observed.json"), "w", encoding="utf-8") as handle:
    json.dump(observed, handle, indent=2, sort_keys=True)
    handle.write("\n")

if failures:
    print(f"vhs-tape-recording: {len(failures)} predeclared check(s) failed: {', '.join(failures)}")
    sys.exit(1)
