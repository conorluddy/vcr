"""Writes the predeclared type-0 MIDI score used by the FluidSynth render fixture.

The note list is the single source of truth: render_check.py imports it.
Standard library only, so the bytes are fully determined by this file.
"""

import struct
import sys
from pathlib import Path

TICKS_PER_BEAT = 480
TEMPO_MICROSECONDS_PER_BEAT = 500_000  # 120 BPM: one beat is 0.5 s
PROGRAM = 0
VELOCITY = 100

# (onset_seconds, duration_seconds, midi_pitch), all onsets and durations exact in ticks.
NOTES: tuple[tuple[float, float, int], ...] = (
    (0.5, 0.4, 60),  # C4
    (1.0, 0.4, 64),  # E4
    (1.5, 0.4, 67),  # G4
    (2.0, 0.4, 72),  # C5
    (3.0, 0.5, 60),  # C4
)


def seconds_to_ticks(seconds: float) -> int:
    ticks = round(seconds * TICKS_PER_BEAT * 2)
    if abs(ticks - seconds * TICKS_PER_BEAT * 2) > 1e-9:
        raise ValueError(f"{seconds} s is not an integer number of ticks")
    return ticks


def midi_end_seconds() -> float:
    return max(onset + duration for onset, duration, _ in NOTES)


def variable_length(value: int) -> bytes:
    groups = [value & 0x7F]
    value >>= 7
    while value:
        groups.append((value & 0x7F) | 0x80)
        value >>= 7
    return bytes(reversed(groups))


def build_track_events() -> list[tuple[int, bytes]]:
    events: list[tuple[int, bytes]] = [
        (0, b"\xff\x51\x03" + TEMPO_MICROSECONDS_PER_BEAT.to_bytes(3, "big")),
        (0, bytes([0xC0, PROGRAM])),
    ]
    for onset, duration, pitch in NOTES:
        events.append((seconds_to_ticks(onset), bytes([0x90, pitch, VELOCITY])))
        events.append((seconds_to_ticks(onset + duration), bytes([0x80, pitch, 0])))
    # Stable sort: events sharing a tick keep insertion order (no collisions in this score).
    events.sort(key=lambda event: event[0])
    return events


def build_midi_bytes() -> bytes:
    track = bytearray()
    previous_tick = 0
    for tick, message in build_track_events():
        track += variable_length(tick - previous_tick) + message
        previous_tick = tick
    track += variable_length(0) + b"\xff\x2f\x00"
    header = b"MThd" + struct.pack(">IHHH", 6, 0, 1, TICKS_PER_BEAT)
    return header + b"MTrk" + struct.pack(">I", len(track)) + bytes(track)


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("usage: score.py <output.mid>")
    Path(sys.argv[1]).write_bytes(build_midi_bytes())
    print(f"wrote {sys.argv[1]}: {len(NOTES)} notes, end {midi_end_seconds()} s")


if __name__ == "__main__":
    main()
