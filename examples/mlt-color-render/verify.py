import hashlib
import json
from pathlib import Path
import subprocess
import sys

outputs = [Path(value) for value in sys.argv[1:3]]
expected_path = Path(sys.argv[3])
record = "--record" in sys.argv[4:]


def probe(path):
    data = json.loads(subprocess.run([
        "ffprobe", "-v", "error", "-count_frames", "-select_streams", "v:0",
        "-show_entries", "stream=codec_name,width,height,r_frame_rate,nb_read_frames",
        "-show_entries", "format=duration", "-of", "json", str(path),
    ], check=True, capture_output=True, text=True).stdout)
    stream = data["streams"][0]
    result = {
        "codec": stream["codec_name"],
        "width": stream["width"],
        "height": stream["height"],
        "frame_rate": stream["r_frame_rate"],
        "frames": int(stream["nb_read_frames"]),
        "duration_seconds": float(data["format"]["duration"]),
    }
    if result != {"codec": "ffv1", "width": 64, "height": 48, "frame_rate": "25/1", "frames": 5, "duration_seconds": 0.2}:
        raise SystemExit(f"unexpected stream metadata for {path}: {result}")
    raw = subprocess.run([
        "ffmpeg", "-v", "error", "-i", str(path), "-fps_mode", "passthrough", "-f", "rawvideo", "-pix_fmt", "rgb24", "-",
    ], check=True, capture_output=True).stdout
    frame_bytes = 64 * 48 * 3
    if len(raw) != result["frames"] * frame_bytes:
        raise SystemExit(f"decoded {len(raw) // frame_bytes} frames from {path}, expected 5")
    center = list(raw[(24 * 64 + 32) * 3:(24 * 64 + 32) * 3 + 3])
    if center[0] < 200 or center[1] > 20 or center[2] > 20:
        raise SystemExit(f"frame center is not red in {path}: {center}")
    return result, raw, center


first, first_pixels, center = probe(outputs[0])
second, second_pixels, _ = probe(outputs[1])
if first_pixels != second_pixels:
    raise SystemExit("decoded pixels differ between repeated MLT renders")
result = {
    "tool": "MLT",
    "version": "7.42.0",
    "producer": "colour:red",
    "consumer": "avformat + FFV1",
    "render": first,
    "center_rgb": center,
    "decoded_rgb_sha256": hashlib.sha256(first_pixels).hexdigest(),
    "repeat_pixels_equal": True,
}
if record:
    expected_path.parent.mkdir(parents=True, exist_ok=True)
    expected_path.write_text(json.dumps(result, indent=2) + "\n")
else:
    expected = json.loads(expected_path.read_text())
    for key in ("version", "producer", "consumer", "render", "center_rgb", "decoded_rgb_sha256", "repeat_pixels_equal"):
        if result[key] != expected[key]:
            raise SystemExit(f"{key} differs from expected: {result[key]} != {expected[key]}")
print(json.dumps(result, indent=2))
