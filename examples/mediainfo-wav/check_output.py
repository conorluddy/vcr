#!/usr/bin/env python3
import json
import sys
from pathlib import Path

root = Path(__file__).resolve().parent
data = json.loads(Path(sys.argv[1]).read_text())
tracks = data["media"]["track"]
general = [track for track in tracks if track.get("@type") == "General"]
audio = [track for track in tracks if track.get("@type") == "Audio"]
assert len(general) == 1, f"expected one General track, got {len(general)}"
assert len(audio) == 1, f"expected one Audio track, got {len(audio)}"
g, a = general[0], audio[0]
assert g.get("Format") == "Wave", g
assert g.get("FileSize") == "16044", g
assert a.get("Format") == "PCM", a
assert a.get("SamplingRate") == "8000", a
assert a.get("Channels") == "1", a
assert a.get("BitDepth") == "16", a
assert a.get("Duration") == "1.000", a
summary = {
    "general_format": g["Format"],
    "file_size_bytes": int(g["FileSize"]),
    "audio_format": a["Format"],
    "sampling_rate_hz": int(a["SamplingRate"]),
    "channels": int(a["Channels"]),
    "bit_depth": int(a["BitDepth"]),
    "duration_seconds": float(a["Duration"]),
}
rendered = json.dumps(summary, indent=2) + "\n"
expected = root / "expected" / "summary.json"
if "--record" in sys.argv:
    expected.parent.mkdir(parents=True, exist_ok=True)
    expected.write_text(rendered)
if expected.read_text() != rendered:
    print("MediaInfo summary differs from expected/summary.json", file=sys.stderr)
    sys.exit(1)
print("mediainfo-wav: OK")
