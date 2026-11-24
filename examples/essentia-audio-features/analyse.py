"""Generate click, tone and level audio, analyse it with essentia.standard and check predeclared bounds.

Usage: analyse.py OUTPUT_JSON
Writes click.wav, tones.wav and level.wav next to OUTPUT_JSON, writes OUTPUT_JSON and exits 1
when any gating check fails. No network, no pretrained models and no example data are used.
"""

import hashlib
import json
import math
import sys
import wave
from pathlib import Path

import numpy as np
from essentia.standard import (
    AudioLoader,
    FrameGenerator,
    LoudnessEBUR128,
    MonoLoader,
    PitchYinFFT,
    RhythmExtractor2013,
    Spectrum,
    Windowing,
)

SAMPLE_RATE_HZ = 44100
BPM = 120.0
TEMPO_TOLERANCE_FRACTION = 0.02
CLICK_COUNT = 18
CLICK_FIRST_S = 0.5
CLICK_PERIOD_S = 0.5
CLICK_TRACK_DURATION_S = 10.0
CLICK_FREQUENCY_HZ = 1000.0
CLICK_LENGTH_S = 0.03
CLICK_DECAY_S = 0.004
CLICK_AMPLITUDE = 0.8
EVENT_TOLERANCE_S = 0.030
TONE_FREQUENCIES_HZ = (440.0, 880.0, 1760.0, 3520.0)
TONE_FIRST_S = 0.5
TONE_PERIOD_S = 1.5
TONE_DURATION_S = 1.0
TONE_TRACK_DURATION_S = 6.0
TONE_AMPLITUDE = 0.5
TONE_FADE_S = 0.010
STEADY_MARGIN_S = 0.25
PITCH_FRAME_SIZE = 2048
PITCH_HOP_SIZE = 512
PITCH_TOLERANCE_CENTS = 10.0
MIN_VOICED_STEADY_FRAMES = 10
LEVEL_FREQUENCY_HZ = 1000.0
LEVEL_AMPLITUDE = 0.5
LEVEL_DURATION_S = 10.0
EXPECTED_INTEGRATED_LUFS = -6.01
LOUDNESS_TOLERANCE_LU = 0.5
ROUND_DECIMALS = 6


# === PUBLIC API ===


def main(arguments: list[str]) -> int:
    if len(arguments) != 1:
        print("usage: analyse.py OUTPUT_JSON", file=sys.stderr)
        return 2
    output_json = Path(arguments[0])
    output_json.parent.mkdir(parents=True, exist_ok=True)
    result = run_analysis(output_json.parent)
    output_json.write_text(json.dumps(result, indent=2, sort_keys=True) + "\n")
    failing_checks = [name for name, passed in result["checks"].items() if not passed]
    if failing_checks:
        print("failing checks: " + ", ".join(failing_checks), file=sys.stderr)
        return 1
    return 0


def run_analysis(output_dir: Path) -> dict[str, object]:
    click_path = output_dir / "click.wav"
    tones_path = output_dir / "tones.wav"
    level_path = output_dir / "level.wav"
    write_wav(click_path, click_track_samples()[:, None])
    write_wav(tones_path, tone_sequence_samples()[:, None])
    write_wav(level_path, level_tone_stereo_samples())

    click = analyse_click_track(click_path)
    tones = analyse_tone_sequence(tones_path)
    level = analyse_level_tone(level_path)

    checks = {
        "inputs_load_at_44100_hz": inputs_load_as_generated(click, tones, level),
        "bpm_within_tolerance": click["checks"]["bpm_within_tolerance"],
        "beats_match_clicks_both_ways": click["checks"]["beats_match_clicks_both_ways"],
        "tone_pitch_within_cents": tones["checks"]["tone_pitch_within_cents"],
        "loudness_within_tolerance": level["checks"]["loudness_within_tolerance"],
    }
    return {
        "checks": checks,
        "all_gating_checks_pass": all(checks.values()),
        "measurements": {"click": click["measurements"], "tones": tones["measurements"], "level": level["measurements"]},
        "hashes": {
            "click_wav_sha256": file_sha256(click_path),
            "tones_wav_sha256": file_sha256(tones_path),
            "level_wav_sha256": file_sha256(level_path),
            **click["hashes"],
            **tones["hashes"],
            **level["hashes"],
        },
    }


# === SIGNAL GENERATION ===


def write_wav(path: Path, channels: np.ndarray) -> None:
    """Write float samples, shape (frames, channels), as 16-bit PCM WAV."""
    pcm = np.round(np.clip(channels, -1.0, 1.0) * 32767).astype("<i2")
    with wave.open(str(path), "wb") as wav_file:
        wav_file.setnchannels(channels.shape[1])
        wav_file.setsampwidth(2)
        wav_file.setframerate(SAMPLE_RATE_HZ)
        wav_file.writeframes(pcm.tobytes())


def click_track_samples() -> np.ndarray:
    samples = np.zeros(round(CLICK_TRACK_DURATION_S * SAMPLE_RATE_HZ))
    burst_time_s = np.arange(round(CLICK_LENGTH_S * SAMPLE_RATE_HZ)) / SAMPLE_RATE_HZ
    burst = (
        CLICK_AMPLITUDE
        * np.sin(2 * np.pi * CLICK_FREQUENCY_HZ * burst_time_s)
        * np.exp(-burst_time_s / CLICK_DECAY_S)
    )
    for click_index in range(CLICK_COUNT):
        start = round((CLICK_FIRST_S + click_index * CLICK_PERIOD_S) * SAMPLE_RATE_HZ)
        samples[start : start + burst.size] += burst
    return samples


def tone_sequence_samples() -> np.ndarray:
    samples = np.zeros(round(TONE_TRACK_DURATION_S * SAMPLE_RATE_HZ))
    tone_length = round(TONE_DURATION_S * SAMPLE_RATE_HZ)
    tone_time_s = np.arange(tone_length) / SAMPLE_RATE_HZ
    fade_length = round(TONE_FADE_S * SAMPLE_RATE_HZ)
    envelope = np.ones(tone_length)
    ramp = np.linspace(0.0, 1.0, fade_length)
    envelope[:fade_length] = ramp
    envelope[-fade_length:] = ramp[::-1]
    for tone_index, frequency_hz in enumerate(TONE_FREQUENCIES_HZ):
        start = round((TONE_FIRST_S + tone_index * TONE_PERIOD_S) * SAMPLE_RATE_HZ)
        samples[start : start + tone_length] = (
            TONE_AMPLITUDE * np.sin(2 * np.pi * frequency_hz * tone_time_s) * envelope
        )
    return samples


def level_tone_stereo_samples() -> np.ndarray:
    time_s = np.arange(round(LEVEL_DURATION_S * SAMPLE_RATE_HZ)) / SAMPLE_RATE_HZ
    mono = LEVEL_AMPLITUDE * np.sin(2 * np.pi * LEVEL_FREQUENCY_HZ * time_s)
    return np.column_stack([mono, mono])


# === ANALYSIS ===


def analyse_click_track(path: Path) -> dict[str, object]:
    samples = MonoLoader(filename=str(path), sampleRate=SAMPLE_RATE_HZ)()
    bpm, ticks, _confidence, _estimates, _intervals = RhythmExtractor2013(method="multifeature")(samples)
    tick_times_s = np.asarray(ticks, dtype=np.float64)
    expected_click_times_s = CLICK_FIRST_S + CLICK_PERIOD_S * np.arange(CLICK_COUNT)
    beats = match_events(expected_click_times_s, tick_times_s)
    tempo_error_fraction = (float(bpm) - BPM) / BPM
    return {
        "measurements": {
            "sample_count": int(samples.size),
            "sample_rate_hz": SAMPLE_RATE_HZ,
            "bpm": round(float(bpm), ROUND_DECIMALS),
            "bpm_error_percent": round(tempo_error_fraction * 100, ROUND_DECIMALS),
            "beats": beats,
        },
        "hashes": {
            "tick_times_sha256": array_sha256(tick_times_s),
            "bpm_sha256": array_sha256(np.asarray([float(bpm)], dtype=np.float64)),
        },
        "checks": {
            "bpm_within_tolerance": abs(tempo_error_fraction) <= TEMPO_TOLERANCE_FRACTION,
            "beats_match_clicks_both_ways": (
                beats["detected_count"] == CLICK_COUNT
                and beats["expected_matched"] == CLICK_COUNT
                and beats["detected_matched"] == CLICK_COUNT
            ),
        },
    }


def analyse_tone_sequence(path: Path) -> dict[str, object]:
    samples = MonoLoader(filename=str(path), sampleRate=SAMPLE_RATE_HZ)()
    frames = pitch_frames(samples)
    tone_reports: list[dict[str, object]] = []
    hashes: dict[str, str] = {}
    all_tones_pass = True
    for tone_index, expected_hz in enumerate(TONE_FREQUENCIES_HZ):
        tone_start_s = TONE_FIRST_S + tone_index * TONE_PERIOD_S
        steady = (frames[:, 0] >= tone_start_s + STEADY_MARGIN_S) & (
            frames[:, 0] <= tone_start_s + TONE_DURATION_S - STEADY_MARGIN_S
        )
        steady_pitch_hz = frames[steady, 1]
        voiced_pitch_hz = steady_pitch_hz[steady_pitch_hz > 0]
        voiced_count = int(voiced_pitch_hz.size)
        median_hz = float(np.median(voiced_pitch_hz)) if voiced_count else math.nan
        error_cents = 1200 * math.log2(median_hz / expected_hz) if voiced_count else math.nan
        tone_passes = voiced_count >= MIN_VOICED_STEADY_FRAMES and abs(error_cents) <= PITCH_TOLERANCE_CENTS
        all_tones_pass = all_tones_pass and tone_passes
        tone_reports.append(
            {
                "expected_hz": expected_hz,
                "voiced_steady_frames": voiced_count,
                "median_hz": round(median_hz, ROUND_DECIMALS),
                "error_cents": round(error_cents, ROUND_DECIMALS),
            }
        )
        hashes[f"tone_{tone_index}_pitch_sha256"] = array_sha256(steady_pitch_hz)
    return {
        "measurements": {"sample_count": int(samples.size), "tones": tone_reports},
        "hashes": hashes,
        "checks": {"tone_pitch_within_cents": all_tones_pass},
    }


def analyse_level_tone(path: Path) -> dict[str, object]:
    stereo, sample_rate, channel_count, _md5, _bit_rate, _codec = AudioLoader(filename=str(path))()
    momentary_lufs, _short_term_lufs, integrated_lufs, _loudness_range = LoudnessEBUR128(
        sampleRate=SAMPLE_RATE_HZ
    )(stereo)
    integrated_value = float(integrated_lufs)
    error_lu = integrated_value - EXPECTED_INTEGRATED_LUFS
    return {
        "measurements": {
            "sample_rate_hz": int(sample_rate),
            "channel_count": int(channel_count),
            "frame_count": int(stereo.shape[0]),
            "integrated_lufs": round(integrated_value, ROUND_DECIMALS),
            "error_lu": round(error_lu, ROUND_DECIMALS),
        },
        "hashes": {
            "integrated_lufs_sha256": array_sha256(np.asarray([integrated_value], dtype=np.float64)),
            "momentary_lufs_sha256": array_sha256(np.asarray(momentary_lufs, dtype=np.float64)),
        },
        "checks": {"loudness_within_tolerance": abs(error_lu) <= LOUDNESS_TOLERANCE_LU},
    }


def inputs_load_as_generated(
    click: dict[str, object], tones: dict[str, object], level: dict[str, object]
) -> bool:
    click_measurements = click["measurements"]
    tone_measurements = tones["measurements"]
    level_measurements = level["measurements"]
    return (
        click_measurements["sample_rate_hz"] == SAMPLE_RATE_HZ
        and click_measurements["sample_count"] == round(CLICK_TRACK_DURATION_S * SAMPLE_RATE_HZ)
        and tone_measurements["sample_count"] == round(TONE_TRACK_DURATION_S * SAMPLE_RATE_HZ)
        and level_measurements["sample_rate_hz"] == SAMPLE_RATE_HZ
        and level_measurements["channel_count"] == 2
        and level_measurements["frame_count"] == round(LEVEL_DURATION_S * SAMPLE_RATE_HZ)
    )


# === HELPERS ===


def pitch_frames(samples: np.ndarray) -> np.ndarray:
    """Return rows of (frame_centre_s, pitch_hz) for every full frame, pitch 0 when unvoiced."""
    window = Windowing(type="hann", size=PITCH_FRAME_SIZE)
    spectrum = Spectrum(size=PITCH_FRAME_SIZE)
    pitch = PitchYinFFT(frameSize=PITCH_FRAME_SIZE, sampleRate=SAMPLE_RATE_HZ)
    rows = []
    frame_generator = FrameGenerator(
        samples, frameSize=PITCH_FRAME_SIZE, hopSize=PITCH_HOP_SIZE, startFromZero=True
    )
    for frame_index, frame in enumerate(frame_generator):
        pitch_hz, _confidence = pitch(spectrum(window(frame)))
        centre_s = (frame_index * PITCH_HOP_SIZE + PITCH_FRAME_SIZE / 2) / SAMPLE_RATE_HZ
        rows.append((centre_s, float(pitch_hz)))
    return np.asarray(rows, dtype=np.float64)


def match_events(expected_s: np.ndarray, detected_s: np.ndarray) -> dict[str, object]:
    if detected_s.size == 0:
        return {"detected_count": 0, "expected_matched": 0, "detected_matched": 0, "max_expected_error_ms": None}
    nearest_detected_error = np.abs(expected_s[:, None] - detected_s[None, :]).min(axis=1)
    nearest_expected_error = np.abs(detected_s[:, None] - expected_s[None, :]).min(axis=1)
    return {
        "detected_count": int(detected_s.size),
        "expected_matched": int(np.sum(nearest_detected_error <= EVENT_TOLERANCE_S)),
        "detected_matched": int(np.sum(nearest_expected_error <= EVENT_TOLERANCE_S)),
        "max_expected_error_ms": round(float(nearest_detected_error.max()) * 1000, ROUND_DECIMALS),
    }


def file_sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def array_sha256(array: np.ndarray) -> str:
    return hashlib.sha256(np.ascontiguousarray(array).tobytes()).hexdigest()


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
