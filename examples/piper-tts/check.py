"""Measure piper WAV outputs against predeclared checks.

Usage: check.py OUTPUT_DIR
Reads OUTPUT_DIR/{default-a,default-b,long-1.5}.wav and the voice files under
OUTPUT_DIR/voices. Writes voice.json (hashes and config rate), checks.json
(gating booleans) and measure.json (numbers and rerun verdict).
Exits 1 when any gating check is false. Standard library only.
"""
import hashlib
import json
import math
import os
import sys
import wave
from array import array

DURATION_MIN_SECONDS = 1.5
DURATION_MAX_SECONDS = 5.0
PEAK_FLOOR_FRACTION = 0.01
RMS_FLOOR_FRACTION = 0.001
LENGTH_SCALE_RATIO_EXPECTED = 1.5
LENGTH_SCALE_RATIO_TOLERANCE = 0.15
VOICE_NAME = "en_US-ryan-low"
FULL_SCALE_16BIT = 32768.0


def sha256_of_file(path):
    with open(path, "rb") as handle:
        return hashlib.sha256(handle.read()).hexdigest()


def read_wav_summary(path):
    with wave.open(path, "rb") as wav:
        channels = wav.getnchannels()
        sample_width_bytes = wav.getsampwidth()
        sample_rate = wav.getframerate()
        frame_count = wav.getnframes()
        frame_bytes = wav.readframes(frame_count)
    samples = array("h", frame_bytes)
    peak = max((abs(value) for value in samples), default=0) / FULL_SCALE_16BIT
    mean_square = sum(value * value for value in samples) / max(len(samples), 1)
    rms = math.sqrt(mean_square) / FULL_SCALE_16BIT
    return {
        "channels": channels,
        "sample_width_bytes": sample_width_bytes,
        "sample_rate": sample_rate,
        "frame_count": frame_count,
        "duration_seconds": frame_count / sample_rate,
        "peak_fraction": peak,
        "rms_fraction": rms,
        "pcm_sha256": hashlib.sha256(frame_bytes).hexdigest(),
        "file_sha256": sha256_of_file(path),
    }


def write_json(path, value):
    with open(path, "w", encoding="utf-8") as handle:
        json.dump(value, handle, indent=2, sort_keys=True)
        handle.write("\n")


def main(output_dir):
    voice_dir = os.path.join(output_dir, "voices")
    config_path = os.path.join(voice_dir, f"{VOICE_NAME}.onnx.json")
    with open(config_path, encoding="utf-8") as handle:
        config_sample_rate = json.load(handle)["audio"]["sample_rate"]

    voice = {
        "model_sha256": sha256_of_file(os.path.join(voice_dir, f"{VOICE_NAME}.onnx")),
        "config_sha256": sha256_of_file(config_path),
        "model_card_sha256": sha256_of_file(os.path.join(voice_dir, "MODEL_CARD")),
        "config_sample_rate": config_sample_rate,
    }

    default_a = read_wav_summary(os.path.join(output_dir, "default-a.wav"))
    default_b = read_wav_summary(os.path.join(output_dir, "default-b.wav"))
    long_15 = read_wav_summary(os.path.join(output_dir, "long-1.5.wav"))
    wavs = (default_a, default_b, long_15)

    duration_ratio = long_15["duration_seconds"] / default_a["duration_seconds"]
    checks = {
        "wav_format_matches_config": all(
            wav["channels"] == 1
            and wav["sample_width_bytes"] == 2
            and wav["sample_rate"] == config_sample_rate
            for wav in wavs
        ),
        "duration_in_range": DURATION_MIN_SECONDS
        <= default_a["duration_seconds"]
        <= DURATION_MAX_SECONDS,
        "audio_non_silent": default_a["peak_fraction"] >= PEAK_FLOOR_FRACTION
        and default_a["rms_fraction"] >= RMS_FLOOR_FRACTION,
        "length_ratio_within_tolerance": abs(duration_ratio - LENGTH_SCALE_RATIO_EXPECTED)
        <= LENGTH_SCALE_RATIO_TOLERANCE,
    }
    measure = {
        "default_a": default_a,
        "default_b": default_b,
        "long_1_5": long_15,
        "duration_ratio_long_over_default": duration_ratio,
        "rerun_pcm_identical": default_a["pcm_sha256"] == default_b["pcm_sha256"],
        "rerun_file_identical": default_a["file_sha256"] == default_b["file_sha256"],
    }

    write_json(os.path.join(output_dir, "voice.json"), voice)
    write_json(os.path.join(output_dir, "checks.json"), {"checks": checks})
    write_json(os.path.join(output_dir, "measure.json"), measure)

    failed = sorted(name for name, passed in checks.items() if not passed)
    if failed:
        print(f"gating checks failed: {', '.join(failed)}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1]))
