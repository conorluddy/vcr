"""Checks two FluidSynth WAV renders against the predeclared score.

Usage:
  render_check.py [--record] <score-a.mid> <score-b.mid> <render-a.wav> <render-b.wav> <fluidsynth-version-line>

Standard library only. Onsets and pitches come from Goertzel power (a single DFT bin per
candidate frequency), so no FFT library is needed. Writes output/metrics.json and
output/envelope.png for inspection; only expected/render.json is committed.
"""

import argparse
import array
import hashlib
import json
import math
import struct
import sys
import wave
import zlib
from pathlib import Path
from typing import Optional

from score import NOTES, build_midi_bytes, midi_end_seconds

EXPECTED_PATH = Path("expected/render.json")
METRICS_PATH = Path("output/metrics.json")
ENVELOPE_PATH = Path("output/envelope.png")

SAMPLE_RATE_HZ = 48_000
CHANNELS = 2
SAMPLE_WIDTH_BYTES = 2
RELEASE_ALLOWANCE_S = 2.0
PEAK_FRACTION_RANGE = (0.05, 0.99)
ONSET_TOLERANCE_S = 0.05
ONSET_WINDOW_S = 0.1
ONSET_HOP_S = 0.005
ONSET_SEARCH_BEFORE_S = 0.2
ONSET_SEARCH_AFTER_S = 0.4
PITCH_WINDOW_START_AFTER_ONSET_S = 0.1
PITCH_WINDOW_LENGTH_S = 0.2
PITCH_CANDIDATES = range(48, 85)


# === PUBLIC API ===


def main() -> None:
    arguments = parse_arguments()
    failures: list[str] = []

    score_a = arguments.score_a.read_bytes()
    score_b = arguments.score_b.read_bytes()
    require(score_a == build_midi_bytes(), "score bytes differ from score.py output", failures)
    require(score_a == score_b, "two MIDI writes differ", failures)

    render_a_bytes = arguments.render_a.read_bytes()
    render_b_bytes = arguments.render_b.read_bytes()
    render_identical = render_a_bytes == render_b_bytes
    require(render_identical, "two FluidSynth renders are not byte-identical", failures)

    params, samples = read_wav(arguments.render_a)
    require(params["sample_rate"] == SAMPLE_RATE_HZ, f"sample rate {params['sample_rate']}", failures)
    require(params["channels"] == CHANNELS, f"channels {params['channels']}", failures)
    require(params["sample_width_bytes"] == SAMPLE_WIDTH_BYTES, f"sample width {params['sample_width_bytes']}", failures)

    duration_s = params["frames"] / SAMPLE_RATE_HZ
    end_s = midi_end_seconds()
    require(end_s <= duration_s <= end_s + RELEASE_ALLOWANCE_S, f"duration {duration_s:.3f} s outside [{end_s}, {end_s + RELEASE_ALLOWANCE_S}]", failures)

    peak = max(abs(sample) for sample in samples) / 32768
    require(PEAK_FRACTION_RANGE[0] <= peak <= PEAK_FRACTION_RANGE[1], f"peak {peak:.4f} outside {PEAK_FRACTION_RANGE}", failures)

    signal = mono_signal(samples)
    note_metrics = [measure_note(signal, onset_s, pitch, failures) for onset_s, _duration_s, pitch in NOTES]

    render_sha256 = sha256_hex(render_a_bytes)
    metrics = {
        "fluidsynth": arguments.fluidsynth_version,
        "midi_sha256": sha256_hex(score_a),
        "midi_bytes_identical": score_a == score_b,
        "render_sha256": render_sha256,
        "render_identical": render_identical,
        "sample_rate": params["sample_rate"],
        "channels": params["channels"],
        "sample_width_bytes": params["sample_width_bytes"],
        "duration_s": round(duration_s, 6),
        "peak_fraction": round(peak, 6),
        "notes": note_metrics,
    }
    METRICS_PATH.write_text(json.dumps(metrics, indent=2) + "\n")
    write_envelope_png(ENVELOPE_PATH, signal, note_metrics)

    expectation = build_expectation(arguments.fluidsynth_version, render_sha256, score_a)
    if failures:
        raise SystemExit("FAIL checks:\n- " + "\n- ".join(failures))
    if arguments.record:
        EXPECTED_PATH.write_text(json.dumps(expectation, indent=2) + "\n")
        print(f"recorded {EXPECTED_PATH}")
        return
    expected = json.loads(EXPECTED_PATH.read_text())
    if expected != expectation:
        raise SystemExit(f"expectation differs\nexpected: {expected}\nactual: {expectation}")
    print("OK fluidsynth-midi-render")


# === HELPERS ===


def parse_arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--record", action="store_true")
    parser.add_argument("score_a", type=Path)
    parser.add_argument("score_b", type=Path)
    parser.add_argument("render_a", type=Path)
    parser.add_argument("render_b", type=Path)
    parser.add_argument("fluidsynth_version", type=str)
    return parser.parse_args()


def require(condition: bool, message: str, failures: list[str]) -> None:
    if not condition:
        failures.append(message)


def sha256_hex(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def read_wav(path: Path) -> tuple[dict[str, int], array.array]:
    with wave.open(str(path), "rb") as wav:
        params = {
            "channels": wav.getnchannels(),
            "sample_width_bytes": wav.getsampwidth(),
            "sample_rate": wav.getframerate(),
            "frames": wav.getnframes(),
        }
        raw = wav.readframes(params["frames"])
    samples = array.array("h")
    if params["sample_width_bytes"] != 2:
        raise SystemExit(f"{path}: expected 16-bit PCM, found {params['sample_width_bytes']} bytes per sample")
    samples.frombytes(raw)
    if sys.byteorder == "big":
        samples.byteswap()
    return params, samples


def mono_signal(samples: array.array) -> list[float]:
    left = samples[0::2]
    right = samples[1::2]
    return [(a + b) / 65536 for a, b in zip(left, right)]


def pitch_frequency_hz(midi_pitch: int) -> float:
    return 440.0 * 2.0 ** ((midi_pitch - 69) / 12)


def goertzel_power(signal: list[float], start_index: int, length: int, frequency_hz: float) -> float:
    coefficient = 2.0 * math.cos(2.0 * math.pi * frequency_hz / SAMPLE_RATE_HZ)
    previous = 0.0
    before_previous = 0.0
    for index in range(start_index, start_index + length):
        current = signal[index] + coefficient * previous - before_previous
        before_previous = previous
        previous = current
    return previous * previous + before_previous * before_previous - coefficient * previous * before_previous


def estimate_onset_seconds(signal: list[float], predicted_onset_s: float, midi_pitch: int) -> Optional[float]:
    window_length = round(ONSET_WINDOW_S * SAMPLE_RATE_HZ)
    frequency_hz = pitch_frequency_hz(midi_pitch)
    step_count = round((ONSET_SEARCH_BEFORE_S + ONSET_SEARCH_AFTER_S) / ONSET_HOP_S)
    first_centre_s = predicted_onset_s - ONSET_SEARCH_BEFORE_S
    centres_and_powers = []
    for step in range(step_count + 1):
        centre_s = first_centre_s + step * ONSET_HOP_S
        start_index = round(centre_s * SAMPLE_RATE_HZ) - window_length // 2
        power = goertzel_power(signal, start_index, window_length, frequency_hz)
        centres_and_powers.append((centre_s, power))
    peak_power = max(power for _, power in centres_and_powers)
    for centre_s, power in centres_and_powers:
        if power >= 0.5 * peak_power:
            return centre_s
    return None


def estimate_pitch(signal: list[float], onset_s: float) -> int:
    start_index = round((onset_s + PITCH_WINDOW_START_AFTER_ONSET_S) * SAMPLE_RATE_HZ)
    length = round(PITCH_WINDOW_LENGTH_S * SAMPLE_RATE_HZ)
    powers = {pitch: goertzel_power(signal, start_index, length, pitch_frequency_hz(pitch)) for pitch in PITCH_CANDIDATES}
    return max(powers, key=lambda pitch: powers[pitch])


def measure_note(signal: list[float], predicted_onset_s: float, predicted_pitch: int, failures: list[str]) -> dict[str, object]:
    detected_onset_s = estimate_onset_seconds(signal, predicted_onset_s, predicted_pitch)
    detected_pitch = estimate_pitch(signal, predicted_onset_s)
    onset_error_s = None if detected_onset_s is None else detected_onset_s - predicted_onset_s
    require(
        onset_error_s is not None and abs(onset_error_s) <= ONSET_TOLERANCE_S,
        f"onset for pitch {predicted_pitch} at {predicted_onset_s} s: error {onset_error_s}",
        failures,
    )
    require(detected_pitch == predicted_pitch, f"pitch at {predicted_onset_s} s: detected {detected_pitch}, predicted {predicted_pitch}", failures)
    return {
        "predicted_onset_s": predicted_onset_s,
        "detected_onset_s": None if detected_onset_s is None else round(detected_onset_s, 6),
        "onset_error_s": None if onset_error_s is None else round(onset_error_s, 6),
        "predicted_midi_pitch": predicted_pitch,
        "detected_midi_pitch": detected_pitch,
    }


def build_expectation(fluidsynth_version: str, render_sha256: str, score_bytes: bytes) -> dict[str, object]:
    return {
        "fluidsynth": fluidsynth_version,
        "soundfont_sha256": "52132b2b83994f0067d3a66b93b4f1b67d53ff8c0d3be90d39f23f92b4585cdd",
        "midi_sha256": sha256_hex(score_bytes),
        "render_sha256": render_sha256,
        "sample_rate": SAMPLE_RATE_HZ,
        "channels": CHANNELS,
        "sample_width_bytes": SAMPLE_WIDTH_BYTES,
        "midi_end_s": midi_end_seconds(),
        "duration_range_s": [midi_end_seconds(), midi_end_seconds() + RELEASE_ALLOWANCE_S],
        "peak_fraction_range": list(PEAK_FRACTION_RANGE),
        "onset_tolerance_s": ONSET_TOLERANCE_S,
        "notes": [
            {"onset_s": onset_s, "duration_s": duration_s, "midi_pitch": pitch}
            for onset_s, duration_s, pitch in NOTES
        ],
        "determinism": "two renders in one run byte-identical; rerun hash equals render_sha256",
    }


# === INSPECTION IMAGE ===


def write_envelope_png(path: Path, signal: list[float], note_metrics: list[dict[str, object]]) -> None:
    width = 1200
    height = 300
    pixels = bytearray(b"\xff" * (width * height * 3))
    total = len(signal)
    for x in range(width):
        low = x * total // width
        high = max(low + 1, (x + 1) * total // width)
        bar_height = int(max(abs(value) for value in signal[low:high]) * (height - 1))
        for y in range(height - bar_height, height):
            set_pixel(pixels, width, x, y, (40, 90, 200))
    for note in note_metrics:
        set_column(pixels, width, height, sample_column(note["predicted_onset_s"], total, width), (220, 30, 30))
        if note["detected_onset_s"] is not None:
            set_column(pixels, width, height, sample_column(note["detected_onset_s"], total, width), (30, 160, 60))
    path.write_bytes(encode_png(width, height, pixels))


def sample_column(seconds: float, total_samples: int, width: int) -> int:
    return min(width - 1, int(seconds * SAMPLE_RATE_HZ * width / total_samples))


def set_pixel(pixels: bytearray, width: int, x: int, y: int, rgb: tuple[int, int, int]) -> None:
    offset = (y * width + x) * 3
    pixels[offset : offset + 3] = bytes(rgb)


def set_column(pixels: bytearray, width: int, height: int, x: int, rgb: tuple[int, int, int]) -> None:
    for y in range(height):
        set_pixel(pixels, width, x, y, rgb)


def encode_png(width: int, height: int, rgb_pixels: bytearray) -> bytes:
    raw = bytearray()
    row_length = width * 3
    for row in range(height):
        raw.append(0)
        raw += rgb_pixels[row * row_length : (row + 1) * row_length]

    def chunk(tag: bytes, data: bytes) -> bytes:
        return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)

    header = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)
    return b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", header) + chunk(b"IDAT", zlib.compress(bytes(raw), 9)) + chunk(b"IEND", b"")


if __name__ == "__main__":
    main()
