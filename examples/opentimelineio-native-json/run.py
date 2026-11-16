#!/usr/bin/env python3
import hashlib
import json
import sys
from pathlib import Path

import opentimelineio as otio


ROOT = Path(__file__).parent
OUTPUT = ROOT / "output"
OUTPUT.mkdir(exist_ok=True)

rate = 24
duration = otio.opentime.RationalTime(48, rate)
available = otio.opentime.TimeRange(otio.opentime.RationalTime(0, rate), duration)

timeline = otio.schema.Timeline(name="fixture")
track = otio.schema.Track(name="V1", kind=otio.schema.TrackKind.Video)
clip = otio.schema.Clip(name="sample", media_reference=otio.schema.ExternalReference(target_url="media/sample.mov", available_range=available), source_range=available)
track.append(clip)
timeline.tracks.append(track)

first = OUTPUT / "timeline.otio"
second = OUTPUT / "timeline-repeat.otio"
otio.adapters.write_to_file(timeline, str(first))
otio.adapters.write_to_file(timeline, str(second))
reopened = otio.adapters.read_from_file(str(first))

assert len(reopened.tracks) == 1
assert len(reopened.tracks[0]) == 1
reopened_clip = reopened.tracks[0][0]
assert isinstance(reopened_clip, otio.schema.Clip)
assert reopened_clip.duration().value == 48
assert reopened_clip.duration().rate == 24
assert reopened_clip.media_reference.target_url == "media/sample.mov"
assert first.read_bytes() == second.read_bytes(), "native OTIO serialization differs between repeated writes"

metrics = {
    "version": otio.__version__,
    "tracks": len(reopened.tracks),
    "clips": len(reopened.tracks[0]),
    "duration_frames": int(reopened_clip.duration().value),
    "rate": int(reopened_clip.duration().rate),
    "media_reference": reopened_clip.media_reference.target_url,
    "repeat_equal": True,
    "sha256": hashlib.sha256(first.read_bytes()).hexdigest(),
}
rendered = json.dumps(metrics, indent=2) + "\n"
metrics_path = OUTPUT / "metrics.json"
if "--record" in sys.argv:
    (ROOT / "expected").mkdir(exist_ok=True)
    (ROOT / "expected" / "metrics.json").write_text(rendered)
else:
    expected = (ROOT / "expected" / "metrics.json").read_text()
    assert rendered == expected, f"metrics differ\nexpected:\n{expected}\nactual:\n{rendered}"
metrics_path.write_text(rendered)
print("opentimelineio-native-json: OK")
