import hashlib
import json
import sys
from importlib.metadata import version
from pathlib import Path

import mido

OUT = Path("output")
EXPECTED = Path("expected/metrics.json")
if version("mido") != "1.3.2":
    raise SystemExit(f"expected mido 1.3.2, found {version('mido')}")

source_path = OUT / "source.mid"
roundtrip_path = OUT / "roundtrip.mid"
parsed = mido.MidiFile(source_path)
assert parsed.type == 1
assert parsed.ticks_per_beat == 480
assert len(parsed.tracks) == 2
tempo = [msg for msg in parsed.tracks[0] if msg.type == "set_tempo"]
assert len(tempo) == 1 and tempo[0].tempo == 500_000 and tempo[0].time == 0
notes = [msg for msg in parsed.tracks[1] if not msg.is_meta]
assert [(msg.type, msg.note, msg.velocity, msg.time) for msg in notes] == [
    ("note_on", 60, 72, 0),
    ("note_off", 60, 0, 480),
]

parsed.save(roundtrip_path)
roundtrip = mido.MidiFile(roundtrip_path)
roundtrip.save(OUT / "roundtrip-again.mid")
source_bytes = source_path.read_bytes()
roundtrip_bytes = roundtrip_path.read_bytes()
again_bytes = (OUT / "roundtrip-again.mid").read_bytes()
assert roundtrip_bytes == again_bytes, "repeated Mido saves differ"

metrics = {
    "mido_version": version("mido"),
    "file_type": parsed.type,
    "ticks_per_beat": parsed.ticks_per_beat,
    "tracks": len(parsed.tracks),
    "tempo_microseconds_per_beat": tempo[0].tempo,
    "note_events": len(notes),
    "note_off_delta_ticks": notes[1].time,
    "source_bytes": len(source_bytes),
    "roundtrip_bytes": len(roundtrip_bytes),
    "roundtrip_sha256": hashlib.sha256(roundtrip_bytes).hexdigest(),
    "repeat_save_identical": True,
}

if "--record" in sys.argv:
    EXPECTED.write_text(json.dumps(metrics, indent=2) + "\n")
    print("recorded expected/metrics.json")
else:
    expected = json.loads(EXPECTED.read_text())
    if metrics != expected:
        raise SystemExit(f"metrics differ\nexpected: {expected}\nactual: {metrics}")
    print("OK mido-roundtrip")
