"""Build the predeclared two-instrument model with pretty_midi and write it. Usage: build_midi.py OUT.mid"""
import sys

import pretty_midi

from spec import FAST_BPM, INSTRUMENTS, TICK_SCALES, TICKS_PER_BEAT

TICK_TABLE_MAX = 2000  # comfortably past the last tick (1680) of the predeclared timeline


def build_model(with_pitch_bends: bool) -> pretty_midi.PrettyMIDI:
    model = pretty_midi.PrettyMIDI(resolution=TICKS_PER_BEAT, initial_tempo=FAST_BPM)
    # pretty_midi 0.2.11.post0 has no public tempo-authoring call; see README "Intent and scope".
    model._tick_scales = list(TICK_SCALES)
    model._update_tick_to_time(TICK_TABLE_MAX)
    for instrument_spec in INSTRUMENTS:
        instrument = pretty_midi.Instrument(program=instrument_spec.program, name=instrument_spec.name)
        for note in instrument_spec.notes:
            instrument.notes.append(
                pretty_midi.Note(velocity=note.velocity, pitch=note.pitch, start=note.start, end=note.end)
            )
        if with_pitch_bends:
            for bend in instrument_spec.bends:
                instrument.pitch_bends.append(pretty_midi.PitchBend(pitch=bend.pitch, time=bend.time))
        model.instruments.append(instrument)
    return model


def main(argv: list[str]) -> None:
    if len(argv) != 2:
        raise SystemExit("usage: build_midi.py OUT.mid")
    build_model(with_pitch_bends=True).write(argv[1])


if __name__ == "__main__":
    main(sys.argv)
