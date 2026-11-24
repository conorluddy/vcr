#!/usr/bin/env python3
"""Check the agg GIF against the predeclared checks in README.md and write metrics.json."""
import hashlib
import json
import subprocess
import sys


EVENT_TIMES_SECONDS = (0.5, 1.0, 2.0, 3.0)
EXPECTED_DURATION_SECONDS = 5.0
DURATION_TOLERANCE_SECONDS = 0.10
EVENT_TIME_TOLERANCE_SECONDS = 0.05
FRAME_COUNT_RANGE = (4, 50)
SCALE_RANGE = (1.9, 2.1)
MIDDLE_FRAME_SECONDS = 2.5


def read_json(path: str) -> dict:
    with open(path, encoding="utf-8") as handle:
        return json.load(handle)


def sha256_of(path: str) -> str:
    with open(path, "rb") as handle:
        return hashlib.sha256(handle.read()).hexdigest()


def middle_frame_standard_deviation(gif_path: str, frames_dir: str, middle_index: int) -> float:
    subprocess.run(
        ["magick", gif_path, "-coalesce", f"{frames_dir}/frame-%03d.png"],
        check=True,
    )
    frame_path = f"{frames_dir}/frame-{middle_index:03d}.png"
    result = subprocess.run(
        ["magick", frame_path, "-format", "%[standard-deviation]", "info:"],
        check=True,
        capture_output=True,
        text=True,
    )
    return float(result.stdout.strip().split()[0])


def main() -> None:
    (
        probe_path,
        identify_path,
        render_path,
        repeat_path,
        size32_probe_path,
        agg_version_path,
        ffprobe_version_path,
        frames_dir,
        metrics_path,
    ) = sys.argv[1:]

    probe = read_json(probe_path)
    stream = probe["streams"][0]
    frames = probe["frames"]
    frame_count = int(stream["nb_read_frames"])
    width = int(stream["width"])
    height = int(stream["height"])
    duration = float(probe["format"]["duration"])
    timestamps = [float(frame["best_effort_timestamp_time"]) for frame in frames]

    identify_width, identify_height = open(identify_path, encoding="utf-8").read().split()
    assert (int(identify_width), int(identify_height)) == (width, height), (identify_width, identify_height, width, height)

    assert stream["codec_name"] == "gif", stream["codec_name"]
    assert sha256_of(render_path) == sha256_of(repeat_path), "rerun is not byte-identical"

    size32_probe = read_json(size32_probe_path)["streams"][0]
    size32_width, size32_height = int(size32_probe["width"]), int(size32_probe["height"])
    for label, scaled, base in (("width", size32_width, width), ("height", size32_height, height)):
        ratio = scaled / base
        assert SCALE_RANGE[0] <= ratio <= SCALE_RANGE[1], f"{label} scale {ratio:.3f} outside {SCALE_RANGE}"

    assert FRAME_COUNT_RANGE[0] <= frame_count <= FRAME_COUNT_RANGE[1], frame_count
    assert len(timestamps) == frame_count, (len(timestamps), frame_count)
    assert all(later > earlier for earlier, later in zip(timestamps, timestamps[1:])), timestamps
    assert abs(duration - EXPECTED_DURATION_SECONDS) <= DURATION_TOLERANCE_SECONDS, duration
    for event_time in EVENT_TIMES_SECONDS:
        nearest = min(abs(stamp - event_time) for stamp in timestamps)
        assert nearest <= EVENT_TIME_TOLERANCE_SECONDS, (event_time, nearest, timestamps)

    middle_index = min(range(frame_count), key=lambda index: abs(timestamps[index] - MIDDLE_FRAME_SECONDS))
    deviation = middle_frame_standard_deviation(render_path, frames_dir, middle_index)
    assert deviation > 0, "middle frame is a single flat colour"

    metrics = {
        "agg_version": open(agg_version_path, encoding="utf-8").read().strip(),
        "ffprobe_version": open(ffprobe_version_path, encoding="utf-8").read().strip(),
        "codec": stream["codec_name"],
        "width": width,
        "height": height,
        "size_32_width": size32_width,
        "size_32_height": size32_height,
        "frame_count": frame_count,
        "frame_timestamps_seconds": [round(stamp, 2) for stamp in timestamps],
        "duration_seconds": round(duration, 2),
        "middle_frame_index": middle_index,
        "middle_frame_standard_deviation": round(deviation, 2),
        "gif_bytes": len(open(render_path, "rb").read()),
        "sha256": sha256_of(render_path),
    }
    with open(metrics_path, "w", encoding="utf-8") as handle:
        json.dump(metrics, handle, indent=2)
        handle.write("\n")


if __name__ == "__main__":
    main()
