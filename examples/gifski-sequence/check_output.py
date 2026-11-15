#!/usr/bin/env python3
import hashlib
import json
import sys


probe_path, gifski_version_path, ffprobe_version_path, gif_path, metrics_path = sys.argv[1:]
probe = json.load(open(probe_path, encoding="utf-8"))
stream = probe["streams"][0]
fmt = probe["format"]
gifski_version = open(gifski_version_path, encoding="utf-8").read().strip()
ffprobe_version = open(ffprobe_version_path, encoding="utf-8").read().strip()
duration = float(fmt["duration"])
frame_count = int(stream.get("nb_read_frames", stream.get("nb_frames", -1)))
timestamps = [float(frame["best_effort_timestamp_time"]) for frame in probe["frames"]]

assert stream["codec_name"] == "gif", stream
assert (int(stream["width"]), int(stream["height"])) == (64, 64), stream
assert frame_count == 3, stream
assert len(timestamps) == 3, timestamps
assert all(abs(actual - expected) <= 0.01 for actual, expected in zip(timestamps, (0.0, 0.33, 0.67))), timestamps
assert abs(duration - 1.0) <= 0.001, duration

with open(gif_path, "rb") as handle:
    gif = handle.read()
metrics = {
    "gifski_version": gifski_version,
    "ffprobe_version": ffprobe_version,
    "codec": stream["codec_name"],
    "width": int(stream["width"]),
    "height": int(stream["height"]),
    "frame_count": frame_count,
    "average_frame_rate": stream["avg_frame_rate"],
    "frame_timestamps_seconds": [round(timestamp, 6) for timestamp in timestamps],
    "duration_seconds": round(duration, 6),
    "gif_bytes": len(gif),
    "sha256": hashlib.sha256(gif).hexdigest(),
}
with open(metrics_path, "w", encoding="utf-8") as handle:
    json.dump(metrics, handle, indent=2, sort_keys=True)
    handle.write("\n")
