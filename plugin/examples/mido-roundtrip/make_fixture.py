from pathlib import Path
from importlib.metadata import version

import mido

OUT = Path("output")
if version("mido") != "1.3.2":
    raise SystemExit(f"expected mido 1.3.2, found {version('mido')}")

midi = mido.MidiFile(type=1, ticks_per_beat=480)
tempo_track = mido.MidiTrack()
tempo_track.append(mido.MetaMessage("set_tempo", tempo=500_000, time=0))
midi.tracks.append(tempo_track)

note_track = mido.MidiTrack()
note_track.append(mido.Message("note_on", channel=0, note=60, velocity=72, time=0))
note_track.append(mido.Message("note_off", channel=0, note=60, velocity=0, time=480))
midi.tracks.append(note_track)
midi.save(OUT / "source.mid")
