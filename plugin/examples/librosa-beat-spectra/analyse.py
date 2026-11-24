"""Generate a click track and a tone sequence, load them with librosa and check predeclared bounds.

Usage: analyse.py OUTPUT_JSON
Writes click.wav and tones.wav next to OUTPUT_JSON, writes OUTPUT_JSON and exits 1
when any gating check fails. No network and no librosa example data are used.
"""
import hashlib
import json
import sys
import wave
from pathlib import Path

import librosa
import numpy as np

SAMPLE_RATE_HZ = 22050
HOP_LENGTH = 512
N_FFT = 2048
BPM = 120.0
CLICK_PERIOD_S = 0.5
CLICK_FIRST_S = 0.5
CLICK_COUNT = 18
CLICK_TRACK_DURATION_S = 10.0
CLICK_FREQUENCY_HZ = 1000.0
CLICK_LENGTH_S = 0.03
CLICK_DECAY_S = 0.004
CLICK_AMPLITUDE = 0.8
TEMPO_TOLERANCE_FRACTION = 0.02
EVENT_TOLERANCE_S = 0.030
TONE_FREQUENCIES_HZ = (440.0, 880.0, 1760.0, 3520.0)
TONE_FIRST_S = 0.5
TONE_PERIOD_S = 1.5
TONE_DURATION_S = 1.0
TONE_TRACK_DURATION_S = 6.0
TONE_AMPLITUDE = 0.5
TONE_FADE_S = 0.010
STEADY_MARGIN_S = 0.25
ROUND_DECIMALS = 6


def write_wav(path: Path, samples: np.ndarray) -> None:
    pcm = np.round(np.clip(samples, -1.0, 1.0) * 32767).astype("<i2")
    with wave.open(str(path), "wb") as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(SAMPLE_RATE_HZ)
        wav_file.writeframes(pcm.tobytes())


def click_track_samples() -> np.ndarray:
    samples = np.zeros(round(CLICK_TRACK_DURATION_S * SAMPLE_RATE_HZ))
    burst_time_s = np.arange(CLICK_LENGTH_S * SAMPLE_RATE_HZ) / SAMPLE_RATE_HZ
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


def array_sha256(array: np.ndarray) -> str:
    return hashlib.sha256(np.ascontiguousarray(array).tobytes()).hexdigest()


def match_events(expected_s: np.ndarray, detected_s: np.ndarray) -> dict[str, object]:
    if detected_s.size == 0:
        return {
            "detected_count": 0,
            "expected_matched": 0,
            "detected_matched": 0,
            "max_expected_error_ms": None,
        }
    nearest_detected_error = np.abs(expected_s[:, None] - detected_s[None, :]).min(axis=1)
    nearest_expected_error = np.abs(detected_s[:, None] - expected_s[None, :]).min(axis=1)
    return {
        "detected_count": int(detected_s.size),
        "expected_matched": int(np.sum(nearest_detected_error <= EVENT_TOLERANCE_S)),
        "detected_matched": int(np.sum(nearest_expected_error <= EVENT_TOLERANCE_S)),
        "max_expected_error_ms": round(float(nearest_detected_error.max()) * 1000, ROUND_DECIMALS),
    }


def analyse_click_track(path: Path) -> tuple[dict[str, object], dict[str, str]]:
    samples, sample_rate = librosa.load(path, sr=None, mono=True)
    tempo_array, beat_times = librosa.beat.beat_track(
        y=samples, sr=sample_rate, hop_length=HOP_LENGTH, units="time"
    )
    tempo_bpm = float(np.atleast_1d(tempo_array)[0])
    onset_times = librosa.onset.onset_detect(
        y=samples, sr=sample_rate, hop_length=HOP_LENGTH, units="time"
    )
    expected_click_times = CLICK_FIRST_S + CLICK_PERIOD_S * np.arange(CLICK_COUNT)
    beats = match_events(expected_click_times, np.asarray(beat_times))
    onsets = match_events(expected_click_times, np.asarray(onset_times))
    measurements: dict[str, object] = {
        "sample_rate_hz": int(sample_rate),
        "sample_count": int(samples.size),
        "tempo_bpm": round(tempo_bpm, ROUND_DECIMALS),
        "beats": beats,
        "onsets": onsets,
    }
    hashes = {
        "click_waveform_sha256": array_sha256(samples.astype(np.float32)),
        "beat_times_sha256": array_sha256(np.asarray(beat_times, dtype=np.float64)),
        "onset_times_sha256": array_sha256(np.asarray(onset_times, dtype=np.float64)),
        "tempo_sha256": array_sha256(np.asarray([tempo_bpm], dtype=np.float64)),
    }
    return measurements, hashes


def analyse_tone_sequence(path: Path) -> tuple[dict[str, object], dict[str, str]]:
    samples, sample_rate = librosa.load(path, sr=None, mono=True)
    magnitude = np.abs(librosa.stft(samples, n_fft=N_FFT, hop_length=HOP_LENGTH))
    frame_times_s = librosa.frames_to_time(
        np.arange(magnitude.shape[1]), sr=sample_rate, hop_length=HOP_LENGTH
    )
    bin_frequencies_hz = librosa.fft_frequencies(sr=sample_rate, n_fft=N_FFT)
    bin_width_hz = float(sample_rate) / N_FFT
    tone_reports: list[dict[str, object]] = []
    for tone_index, expected_hz in enumerate(TONE_FREQUENCIES_HZ):
        tone_start_s = TONE_FIRST_S + tone_index * TONE_PERIOD_S
        steady_frames = (frame_times_s >= tone_start_s + STEADY_MARGIN_S) & (
            frame_times_s <= tone_start_s + TONE_DURATION_S - STEADY_MARGIN_S
        )
        mean_magnitude = magnitude[:, steady_frames].mean(axis=1)
        peak_bin = int(np.argmax(mean_magnitude))
        peak_hz = float(bin_frequencies_hz[peak_bin])
        error_hz = peak_hz - expected_hz
        tone_reports.append(
            {
                "expected_hz": expected_hz,
                "peak_bin": peak_bin,
                "peak_hz": round(peak_hz, ROUND_DECIMALS),
                "error_hz": round(error_hz, ROUND_DECIMALS),
                "steady_frame_count": int(steady_frames.sum()),
                "within_one_bin": abs(error_hz) <= bin_width_hz,
            }
        )
    measurements: dict[str, object] = {
        "sample_rate_hz": int(sample_rate),
        "sample_count": int(samples.size),
        "bin_width_hz": round(bin_width_hz, ROUND_DECIMALS),
        "tones": tone_reports,
    }
    hashes = {
        "tone_waveform_sha256": array_sha256(samples.astype(np.float32)),
        "stft_magnitude_sha256": array_sha256(magnitude.astype(np.float32)),
    }
    return measurements, hashes


def build_checks(click: dict[str, object], tones: dict[str, object]) -> dict[str, bool]:
    beats = click["beats"]
    onsets = click["onsets"]
    tempo_error_fraction = abs(float(click["tempo_bpm"]) - BPM) / BPM
    return {
        "sample_rates_match_generated": click["sample_rate_hz"] == SAMPLE_RATE_HZ
        and tones["sample_rate_hz"] == SAMPLE_RATE_HZ,
        "click_sample_count_matches": click["sample_count"]
        == round(CLICK_TRACK_DURATION_S * SAMPLE_RATE_HZ),
        "tempo_within_tolerance": tempo_error_fraction <= TEMPO_TOLERANCE_FRACTION,
        "beats_match_clicks_both_ways": beats["expected_matched"] == CLICK_COUNT
        and beats["detected_matched"] == CLICK_COUNT
        and beats["detected_count"] == CLICK_COUNT,
        "onsets_match_clicks_both_ways": onsets["expected_matched"] == CLICK_COUNT
        and onsets["detected_matched"] == CLICK_COUNT
        and onsets["detected_count"] == CLICK_COUNT,
        "tone_sample_rate_and_length_match": tones["sample_count"]
        == round(TONE_TRACK_DURATION_S * SAMPLE_RATE_HZ),
        "tone_peaks_within_one_bin": all(tone["within_one_bin"] for tone in tones["tones"]),
    }


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit("usage: analyse.py OUTPUT_JSON")
    output_json = Path(sys.argv[1])
    output_dir = output_json.parent
    click_path = output_dir / "click.wav"
    tones_path = output_dir / "tones.wav"
    write_wav(click_path, click_track_samples())
    write_wav(tones_path, tone_sequence_samples())

    click, click_hashes = analyse_click_track(click_path)
    tones, tone_hashes = analyse_tone_sequence(tones_path)
    checks = build_checks(click, tones)
    report = {
        "predeclared": {
            "bpm": BPM,
            "tempo_tolerance_fraction": TEMPO_TOLERANCE_FRACTION,
            "event_tolerance_ms": EVENT_TOLERANCE_S * 1000,
            "click_count": CLICK_COUNT,
            "tone_frequencies_hz": list(TONE_FREQUENCIES_HZ),
            "n_fft": N_FFT,
            "hop_length": HOP_LENGTH,
        },
        "click_track": click,
        "tone_sequence": tones,
        "hashes": {**click_hashes, **tone_hashes},
        "checks": checks,
    }
    output_json.write_text(json.dumps(report, indent=2, sort_keys=True) + "\n")
    if not all(checks.values()):
        print(json.dumps(checks, indent=2, sort_keys=True), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
