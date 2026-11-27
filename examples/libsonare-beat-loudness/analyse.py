"""Generate click tracks, load them with libsonare and check predeclared bounds against truth.

Usage: analyse.py OUTPUT_JSON SINE_WAV
SINE_WAV is made by run.sh with sox. Click WAVs are written next to OUTPUT_JSON.
Prints KNOWN FAIL for each failing check, writes OUTPUT_JSON and exits 0 when it ran.
"""
import json
import sys
import wave
from pathlib import Path

import numpy as np
import libsonare

SAMPLE_RATE = 22050
DURATION_S = 10.0
FIRST_CLICK_S = 0.5
TEMPO_TOLERANCE = 0.02      # +-2 % of true BPM
BEAT_TOLERANCE_S = 0.040    # each detected beat within 40 ms of a true click, and vice versa
ONSET_TOLERANCE_S = 0.030   # each detected onset within 30 ms of a true click, and vice versa
LUFS_TOLERANCE = 0.5        # LU
SINE_TRUE_LUFS = 20 * np.log10(0.1) - 3.01   # mono 997 Hz sine, peak 0.1: 10*log10(A^2/2)


def write_clicks(path, bpm):
    period = 60.0 / bpm
    times = np.arange(FIRST_CLICK_S, DURATION_S - 0.03, period)
    signal = np.zeros(int(SAMPLE_RATE * DURATION_S))
    burst_t = np.arange(int(0.03 * SAMPLE_RATE)) / SAMPLE_RATE
    burst = 0.8 * np.sin(2 * np.pi * 1000 * burst_t) * np.exp(-burst_t / 0.004)
    for start in (times * SAMPLE_RATE).astype(int):
        signal[start:start + burst.size] += burst
    with wave.open(str(path), "wb") as out:
        out.setnchannels(1)
        out.setsampwidth(2)
        out.setframerate(SAMPLE_RATE)
        out.writeframes((signal * 32767).astype("<i2").tobytes())
    return times


def worst_mismatch_s(detected, truth):
    detected = np.asarray(detected, dtype=float)
    missed = max(np.min(np.abs(detected - t)) for t in truth)
    extra = max(np.min(np.abs(truth - d)) for d in detected)
    return float(max(missed, extra))


def check_clicks(directory, bpm):
    path = directory / f"click-{bpm}.wav"
    truth = write_clicks(path, bpm)
    audio = libsonare.Audio.from_file(str(path))
    detected_bpm = audio.detect_bpm()
    beats = audio.detect_beats()
    onsets = audio.detect_onsets()
    beat_error = worst_mismatch_s(beats, truth)
    onset_error = worst_mismatch_s(onsets, truth)
    return {
        "true_click_count": int(truth.size),
        "bpm": round(float(detected_bpm), 3),
        "beat_count": int(len(beats)),
        "onset_count": int(len(onsets)),
        "max_beat_error_ms": round(beat_error * 1000, 1),
        "max_onset_error_ms": round(onset_error * 1000, 1),
        "checks": {
            f"bpm_{bpm}_within_2_percent": abs(detected_bpm - bpm) <= bpm * TEMPO_TOLERANCE,
            f"beats_{bpm}_count_matches_clicks": len(beats) == truth.size,
            f"beats_{bpm}_within_40_ms": beat_error <= BEAT_TOLERANCE_S,
            f"onsets_{bpm}_count_matches_clicks": len(onsets) == truth.size,
            f"onsets_{bpm}_within_30_ms": onset_error <= ONSET_TOLERANCE_S,
        },
    }


def main(output_json, sine_wav):
    directory = Path(output_json).parent
    report = {}
    checks = {}
    for bpm in (120, 90):
        result = check_clicks(directory, bpm)
        checks.update(result.pop("checks"))
        report[f"click_{bpm}"] = result
    loudness = libsonare.Audio.from_file(sine_wav).lufs()
    report["sine_integrated_lufs"] = round(float(loudness.integrated_lufs), 2)
    report["sine_true_lufs"] = round(float(SINE_TRUE_LUFS), 2)
    checks["sine_lufs_within_0_5_lu"] = abs(loudness.integrated_lufs - SINE_TRUE_LUFS) <= LUFS_TOLERANCE
    checks = {name: bool(passed) for name, passed in checks.items()}
    report["checks"] = checks
    Path(output_json).write_text(json.dumps(report, indent=2) + "\n")
    for name, passed in checks.items():
        if not passed:
            print(f"KNOWN FAIL: {name}")


main(sys.argv[1], sys.argv[2])
