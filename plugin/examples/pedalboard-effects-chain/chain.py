"""Run a built-in pedalboard chain over generated audio and check the predeclared claims.

Usage: chain.py OUTPUT_DIR
Writes OUTPUT_DIR/roundtrip.wav and prints a JSON report to stdout.
Exits 1 when any gating check fails; the report is printed either way.
Built-in processors only: no plugin hosting.
"""
import hashlib
import json
import math
import sys
from pathlib import Path

import numpy as np
from pedalboard import Compressor, Gain, HighpassFilter, Limiter, Pedalboard
from pedalboard.io import AudioFile

# === PREDECLARED PARAMETERS (see README, Plan before running) ===
SAMPLE_RATE_HZ = 48000
DURATION_S = 2.0
NOISE_SEED = 20261124
HIGHPASS_CUTOFF_HZ = 1000.0
LOW_TONE_HZ = 200.0
HIGH_TONE_HZ = 5000.0
TONE_AMPLITUDE = 0.1
NOISE_AMPLITUDE = 0.1
LOUD_TONE_AMPLITUDE = 0.8
LOUD_TONE_DURATION_S = 1.0
MIN_LOW_TONE_ATTENUATION_DB = 12.0
MAX_HIGH_TONE_DEVIATION_DB = 0.5
LIMITER_THRESHOLD_DB = -1.0
PEAK_TOLERANCE_DB = 0.1
ROUNDTRIP_TOLERANCE = 2 / 32768
LOW_TONE_WINDOW_S = (0.1, 0.4)
HIGH_TONE_WINDOW_S = (0.6, 0.9)
DECIMALS = 6


# === PUBLIC API ===
def main(argv: list[str]) -> int:
    if len(argv) != 2:
        sys.exit("usage: chain.py OUTPUT_DIR")
    output_dir = Path(argv[1])
    output_dir.mkdir(parents=True, exist_ok=True)
    report = build_report(output_dir)
    print(json.dumps(report, indent=2, sort_keys=True))
    return 0 if report["all_passed"] else 1


def build_report(output_dir: Path) -> dict:
    signal = build_test_signal()

    shared_chain = build_chain(includes_highpass=True)
    first_pass = shared_chain(signal, SAMPLE_RATE_HZ)
    second_pass = shared_chain(signal, SAMPLE_RATE_HZ)
    fresh_pass = build_chain(includes_highpass=True)(signal, SAMPLE_RATE_HZ)
    reference_pass = build_chain(includes_highpass=False)(signal, SAMPLE_RATE_HZ)

    low_attenuation_db = rms_db(reference_pass, LOW_TONE_WINDOW_S) - rms_db(first_pass, LOW_TONE_WINDOW_S)
    high_deviation_db = rms_db(first_pass, HIGH_TONE_WINDOW_S) - rms_db(reference_pass, HIGH_TONE_WINDOW_S)

    loud_pass = build_chain(includes_highpass=True)(build_loud_signal(), SAMPLE_RATE_HZ)
    loud_peak_dbfs = 20.0 * math.log10(float(np.max(np.abs(loud_pass))))

    roundtrip_diff, read_frames, read_rate, read_channels = write_and_read_back(
        first_pass, output_dir / "roundtrip.wav"
    )

    checks = {
        "length_rate_and_channels_unchanged": (
            first_pass.shape[0] == signal.shape[0] and read_rate == SAMPLE_RATE_HZ and read_channels == 1
        ),
        "highpass_attenuates_low_tone": low_attenuation_db >= MIN_LOW_TONE_ATTENUATION_DB,
        "highpass_passes_high_tone": abs(high_deviation_db) <= MAX_HIGH_TONE_DEVIATION_DB,
        "limiter_peak_at_or_below_threshold": loud_peak_dbfs <= LIMITER_THRESHOLD_DB + PEAK_TOLERANCE_DB,
        "repeat_processing_identical": bool(
            np.array_equal(first_pass, second_pass) and np.array_equal(first_pass, fresh_pass)
        ),
        "wav_round_trip_within_tolerance": read_frames == first_pass.shape[0] and roundtrip_diff <= ROUNDTRIP_TOLERANCE,
    }

    return {
        "signal": {
            "sample_rate_hz": SAMPLE_RATE_HZ,
            "frames": int(signal.shape[0]),
            "noise_seed": NOISE_SEED,
        },
        "measurements": {
            "low_tone_attenuation_db": round(low_attenuation_db, DECIMALS),
            "high_tone_deviation_db": round(high_deviation_db, DECIMALS),
            "loud_peak_dbfs": round(loud_peak_dbfs, DECIMALS),
            "roundtrip_max_abs_diff": round(roundtrip_diff, DECIMALS),
            "output_frames": int(first_pass.shape[0]),
            "output_sample_rate_hz": read_rate,
            "output_sha256": hashlib.sha256(first_pass.astype("<f4").tobytes()).hexdigest(),
        },
        "checks": checks,
        "all_passed": all(checks.values()),
    }


# === SIGNAL AND CHAIN ===
def build_chain(includes_highpass: bool) -> Pedalboard:
    stages = [HighpassFilter(cutoff_frequency_hz=HIGHPASS_CUTOFF_HZ)] if includes_highpass else []
    stages += [
        Compressor(threshold_db=-6.0, ratio=4.0, attack_ms=1.0, release_ms=100.0),
        Gain(gain_db=6.0),
        Limiter(threshold_db=LIMITER_THRESHOLD_DB, release_ms=100.0),
    ]
    return Pedalboard(stages)


def build_test_signal() -> np.ndarray:
    frame_count = int(SAMPLE_RATE_HZ * DURATION_S)
    time_s = np.arange(frame_count) / SAMPLE_RATE_HZ
    signal = np.zeros(frame_count, dtype=np.float64)
    low_window = time_window(0.0, 0.5)
    high_window = time_window(0.5, 1.0)
    noise_window = time_window(1.0, 1.5)
    signal[low_window] = TONE_AMPLITUDE * np.sin(2 * np.pi * LOW_TONE_HZ * time_s[low_window])
    signal[high_window] = TONE_AMPLITUDE * np.sin(2 * np.pi * HIGH_TONE_HZ * time_s[high_window])
    noise_generator = np.random.default_rng(NOISE_SEED)
    noise_length = noise_window.stop - noise_window.start
    signal[noise_window] = noise_generator.uniform(-NOISE_AMPLITUDE, NOISE_AMPLITUDE, size=noise_length)
    return signal.astype(np.float32)


def build_loud_signal() -> np.ndarray:
    frame_count = int(SAMPLE_RATE_HZ * LOUD_TONE_DURATION_S)
    time_s = np.arange(frame_count) / SAMPLE_RATE_HZ
    return (LOUD_TONE_AMPLITUDE * np.sin(2 * np.pi * HIGH_TONE_HZ * time_s)).astype(np.float32)


def write_and_read_back(samples: np.ndarray, path: Path) -> tuple[float, int, int, int]:
    with AudioFile(str(path), "w", SAMPLE_RATE_HZ, 1) as output_file:
        output_file.write(samples.reshape(1, -1))
    with AudioFile(str(path)) as input_file:
        read_samples = input_file.read(input_file.frames)
        read_rate = int(input_file.samplerate)
        read_channels = int(input_file.num_channels)
    read_frames = int(read_samples.shape[-1])
    overlap = min(read_frames, samples.shape[0])
    max_diff = float(np.max(np.abs(read_samples[0, :overlap] - samples[:overlap])))
    return max_diff, read_frames, read_rate, read_channels


# === HELPERS ===
def time_window(start_s: float, end_s: float) -> slice:
    return slice(int(round(start_s * SAMPLE_RATE_HZ)), int(round(end_s * SAMPLE_RATE_HZ)))


def rms_db(samples: np.ndarray, window_s: tuple[float, float]) -> float:
    window = time_window(*window_s)
    rms = float(np.sqrt(np.mean(np.square(samples[window].astype(np.float64)))))
    return 20.0 * math.log10(rms)


if __name__ == "__main__":
    sys.exit(main(sys.argv))
