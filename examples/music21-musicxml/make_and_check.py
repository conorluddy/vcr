import hashlib
import json
import platform
import re
import sys
from pathlib import Path

import music21
from music21 import converter, meter, note, stream


def main():
    out = Path(sys.argv[1])
    out.mkdir(parents=True, exist_ok=True)
    score = stream.Score()
    part = stream.Part()
    part.id = "P1"
    measure = stream.Measure(number=1)
    measure.append(meter.TimeSignature("4/4"))
    for pitch, duration in [("C4", 1.0), ("D4", 0.5), ("E-4", 1.5)]:
        measure.append(note.Note(pitch, quarterLength=duration))
    part.append(measure)
    score.insert(0, part)

    xml_path = out / "generated.musicxml"
    score.write("musicxml", fp=xml_path)
    reopened = converter.parse(xml_path, forceSource=True)
    notes = list(reopened.recurse().getElementsByClass(note.Note))
    pitches = [n.pitch.nameWithOctave for n in notes]
    durations = [float(n.duration.quarterLength) for n in notes]
    expected_pitches = ["C4", "D4", "E-4"]
    expected_durations = [1.0, 0.5, 1.5]
    if pitches != expected_pitches:
        raise SystemExit(f"pitch mismatch: {pitches}")
    if durations != expected_durations:
        raise SystemExit(f"duration mismatch: {durations}")
    summary = {
        "music21_version": music21.__version__,
        "python_version": platform.python_version(),
        "platform": platform.system().lower(),
        "score": {"measures": 1, "notes": len(notes), "pitches": pitches, "quarter_lengths": durations, "total_quarter_length": sum(durations)},
        "normalized_musicxml_sha256": hashlib.sha256(re.sub(rb"P[a-f0-9]{32}", b"P<generated-id>", xml_path.read_bytes())).hexdigest(),
    }
    if summary["music21_version"] != "10.5.2" or summary["python_version"] != "3.12.13":
        raise SystemExit(f"unexpected runtime: {summary}")
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
