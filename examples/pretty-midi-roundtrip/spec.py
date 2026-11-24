"""Predeclared values for the pretty-midi fixture. These constants are the claim; see README.md."""
from dataclasses import dataclass

TICKS_PER_BEAT = 480
FAST_BPM = 120.0
SLOW_BPM = 60.0
TEMPO_CHANGE_TICK = 960  # 1.0 s at FAST_BPM
TEMPO_CHANGE_SECONDS = 1.0
END_TIME_SECONDS = 2.5
PIANO_ROLL_FS = 8
PIANO_ROLL_COLUMNS = 20  # int(END_TIME_SECONDS * PIANO_ROLL_FS)
# One tick at the slower tempo is the coarser tick: the tolerance for every time check.
TOLERANCE_SECONDS = 60.0 / (SLOW_BPM * TICKS_PER_BEAT)
# (tick, seconds per tick): the tempo map handed to pretty_midi's private tick table.
TICK_SCALES = (
    (0, 60.0 / (FAST_BPM * TICKS_PER_BEAT)),
    (TEMPO_CHANGE_TICK, 60.0 / (SLOW_BPM * TICKS_PER_BEAT)),
)
EXPECTED_TEMPO_TIMES = (0.0, TEMPO_CHANGE_SECONDS)
EXPECTED_TEMPI = (FAST_BPM, SLOW_BPM)


@dataclass(frozen=True)
class NoteSpec:
    pitch: int
    velocity: int
    start: float
    end: float


@dataclass(frozen=True)
class BendSpec:
    time: float
    pitch: int


@dataclass(frozen=True)
class InstrumentSpec:
    name: str
    program: int
    notes: tuple[NoteSpec, ...]
    bends: tuple[BendSpec, ...]


INSTRUMENTS = (
    InstrumentSpec(
        name="piano",
        program=0,
        notes=(
            NoteSpec(pitch=60, velocity=80, start=0.0, end=0.5),
            NoteSpec(pitch=64, velocity=100, start=0.5, end=1.0),
            NoteSpec(pitch=67, velocity=90, start=1.0, end=2.0),
        ),
        bends=(BendSpec(time=0.25, pitch=4096), BendSpec(time=1.5, pitch=-2048)),
    ),
    InstrumentSpec(
        name="bass",
        program=33,
        notes=(
            NoteSpec(pitch=36, velocity=70, start=0.25, end=0.75),
            NoteSpec(pitch=43, velocity=110, start=1.5, end=2.5),
        ),
        bends=(),
    ),
)

# Piano-roll rows: (pitch, first column, last column inclusive, velocity).
EXPECTED_PIANO_ROLL_ROWS = (
    (60, 0, 3, 80),
    (64, 4, 7, 100),
    (67, 8, 15, 90),
    (36, 2, 5, 70),
    (43, 12, 19, 110),
)
