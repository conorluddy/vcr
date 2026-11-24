"""Read back two MIDI files written by build_midi.py and check them against spec.py.
Usage: check.py FIRST.mid SECOND.mid. Prints checks JSON; exits 1 if any gating check fails."""
import hashlib
import json
import platform
import sys
from importlib.metadata import version
from pathlib import Path

import numpy as np
import pretty_midi

from build_midi import build_model
from spec import (
    EXPECTED_PIANO_ROLL_ROWS,
    EXPECTED_TEMPI,
    EXPECTED_TEMPO_TIMES,
    END_TIME_SECONDS,
    INSTRUMENTS,
    PIANO_ROLL_COLUMNS,
    PIANO_ROLL_FS,
    TOLERANCE_SECONDS,
)

TEMPO_BPM_TOLERANCE = 1e-6


def round_metric(value: float) -> float:
    return round(float(value), 9)


def numpy_scalar_to_builtin(value: object) -> object:
    if isinstance(value, np.generic):
        return value.item()
    raise TypeError(f"not JSON serialisable: {type(value).__name__}")


def sha256_of(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def check_notes(read: pretty_midi.PrettyMIDI, checks: dict, measured: dict) -> None:
    max_error = 0.0
    checks["instrument_count_is_two"] = len(read.instruments) == len(INSTRUMENTS)
    measured["programs"] = [instrument.program for instrument in read.instruments]
    checks["programs_match"] = measured["programs"] == [spec.program for spec in INSTRUMENTS]
    notes_match = True
    for instrument, spec in zip(read.instruments, INSTRUMENTS):
        expected = sorted(spec.notes, key=lambda note: note.start)
        actual = sorted(instrument.notes, key=lambda note: note.start)
        if len(actual) != len(expected):
            notes_match = False
            continue
        for note, want in zip(actual, expected):
            if note.pitch != want.pitch or note.velocity != want.velocity:
                notes_match = False
            max_error = max(max_error, abs(note.start - want.start), abs(note.end - want.end))
    checks["note_pitch_velocity_exact"] = notes_match
    checks["note_times_within_one_tick"] = max_error <= TOLERANCE_SECONDS
    measured["note_count"] = sum(len(instrument.notes) for instrument in read.instruments)
    measured["max_note_time_error_seconds"] = round_metric(max_error)


def check_pitch_bends(read: pretty_midi.PrettyMIDI, checks: dict, measured: dict) -> None:
    max_error = 0.0
    bends_match = True
    for instrument, spec in zip(read.instruments, INSTRUMENTS):
        actual = sorted(instrument.pitch_bends, key=lambda bend: bend.time)
        if len(actual) != len(spec.bends):
            bends_match = False
            continue
        for bend, want in zip(actual, spec.bends):
            if bend.pitch != want.pitch:
                bends_match = False
            max_error = max(max_error, abs(bend.time - want.time))
    checks["pitch_bend_values_exact"] = bends_match
    checks["pitch_bend_times_within_one_tick"] = max_error <= TOLERANCE_SECONDS
    measured["max_pitch_bend_time_error_seconds"] = round_metric(max_error)


def check_tempo_and_end(read: pretty_midi.PrettyMIDI, checks: dict, measured: dict) -> None:
    times, tempi = read.get_tempo_changes()
    measured["tempo_change_times_seconds"] = [round_metric(t) for t in times]
    measured["tempo_changes_bpm"] = [round_metric(t) for t in tempi]
    checks["tempo_change_times_within_one_tick"] = len(times) == len(EXPECTED_TEMPO_TIMES) and all(
        abs(t - want) <= TOLERANCE_SECONDS for t, want in zip(times, EXPECTED_TEMPO_TIMES)
    )
    checks["tempo_values_match"] = len(tempi) == len(EXPECTED_TEMPI) and all(
        abs(bpm - want) <= TEMPO_BPM_TOLERANCE for bpm, want in zip(tempi, EXPECTED_TEMPI)
    )
    end_time = read.get_end_time()
    measured["end_time_seconds"] = round_metric(end_time)
    checks["end_time_within_one_tick"] = abs(end_time - END_TIME_SECONDS) <= TOLERANCE_SECONDS


def check_piano_roll(checks: dict, measured: dict) -> None:
    roll = build_model(with_pitch_bends=False).get_piano_roll(fs=PIANO_ROLL_FS)
    measured["piano_roll_shape"] = list(roll.shape)
    checks["piano_roll_shape"] = roll.shape == (128, PIANO_ROLL_COLUMNS)
    actual_cells = {
        (int(row), int(column)): int(roll[row, column]) for row, column in np.argwhere(roll > 0)
    }
    expected_cells = {
        (pitch, column): velocity
        for pitch, first, last, velocity in EXPECTED_PIANO_ROLL_ROWS
        for column in range(first, last + 1)
    }
    checks["piano_roll_active_cells_exact"] = actual_cells == expected_cells
    measured["piano_roll_nonzero_cells"] = len(actual_cells)


def check_reruns_identical(first: Path, second: Path, checks: dict, measured: dict) -> None:
    measured["first_sha256"] = sha256_of(first)
    measured["second_sha256"] = sha256_of(second)
    measured["bytes"] = first.stat().st_size
    checks["reruns_byte_identical"] = first.read_bytes() == second.read_bytes()


def main(argv: list[str]) -> None:
    if len(argv) != 3:
        raise SystemExit("usage: check.py FIRST.mid SECOND.mid")
    first, second = Path(argv[1]), Path(argv[2])
    read = pretty_midi.PrettyMIDI(str(first))
    checks: dict[str, bool] = {}
    measured: dict[str, object] = {
        "pretty_midi_version": version("pretty_midi"),
        "mido_version": version("mido"),
        "numpy_version": version("numpy"),
        "python_version": platform.python_version(),
    }
    check_notes(read, checks, measured)
    check_pitch_bends(read, checks, measured)
    check_tempo_and_end(read, checks, measured)
    check_piano_roll(checks, measured)
    check_reruns_identical(first, second, checks, measured)
    measured["checks"] = {name: bool(passed) for name, passed in checks.items()}
    print(json.dumps(measured, indent=2, sort_keys=True, default=numpy_scalar_to_builtin))
    failed = sorted(name for name, passed in checks.items() if not passed)
    if failed:
        print(f"failed checks: {', '.join(failed)}", file=sys.stderr)
        raise SystemExit(1)


if __name__ == "__main__":
    main(sys.argv)
