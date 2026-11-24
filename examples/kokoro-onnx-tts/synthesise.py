"""Synthesise the fixed sentence twice in one process and record what was written.

Usage: synthesise.py MODEL_DIR OUT_DIR
Writes OUT_DIR/synth.wav, OUT_DIR/synth-rerun.wav and OUT_DIR/measures.json.
"""

import hashlib
import importlib.metadata
import json
import sys
import wave
from pathlib import Path

import numpy as np
from kokoro_onnx import Kokoro

SENTENCE = "The quick brown fox jumps over the lazy dog."
VOICE_NAME = "af_heart"
SPEED = 1.0
LANGUAGE = "en-us"
MODEL_FILE_NAME = "kokoro-v1.0.onnx"
VOICES_FILE_NAME = "voices-v1.0.bin"


def pcm16FromFloatSamples(floatSamples: np.ndarray) -> np.ndarray:
    return (np.clip(floatSamples, -1.0, 1.0) * 32767.0).round().astype("<i2")


def writeMonoPcm16Wav(wavPath: Path, pcm16: np.ndarray, sampleRateHz: int) -> None:
    with wave.open(str(wavPath), "wb") as wavFile:
        wavFile.setnchannels(1)
        wavFile.setsampwidth(2)
        wavFile.setframerate(sampleRateHz)
        wavFile.writeframes(pcm16.tobytes())


def measureSamples(pcm16: np.ndarray, sampleRateHz: int) -> dict[str, object]:
    normalised = pcm16.astype(np.float64) / 32767.0
    return {
        "sample_rate_hz": sampleRateHz,
        "frame_count": int(pcm16.size),
        "duration_s": pcm16.size / sampleRateHz,
        "rms_full_scale": float(np.sqrt(np.mean(normalised**2))),
        "pcm16_sha256": hashlib.sha256(pcm16.tobytes()).hexdigest(),
    }


def main(argv: list[str]) -> int:
    if len(argv) != 3:
        print("usage: synthesise.py MODEL_DIR OUT_DIR", file=sys.stderr)
        return 2
    modelDirectory = Path(argv[1])
    outputDirectory = Path(argv[2])
    outputDirectory.mkdir(parents=True, exist_ok=True)

    kokoro = Kokoro(
        str(modelDirectory / MODEL_FILE_NAME), str(modelDirectory / VOICES_FILE_NAME)
    )
    if VOICE_NAME not in kokoro.voices:
        print(f"voice {VOICE_NAME!r} is not in the voice bank; stopping.", file=sys.stderr)
        return 1

    firstSamples, firstRateHz = kokoro.create(
        SENTENCE, voice=VOICE_NAME, speed=SPEED, lang=LANGUAGE
    )
    secondSamples, secondRateHz = kokoro.create(
        SENTENCE, voice=VOICE_NAME, speed=SPEED, lang=LANGUAGE
    )

    firstPcm16 = pcm16FromFloatSamples(np.asarray(firstSamples, dtype=np.float32))
    secondPcm16 = pcm16FromFloatSamples(np.asarray(secondSamples, dtype=np.float32))
    writeMonoPcm16Wav(outputDirectory / "synth.wav", firstPcm16, firstRateHz)
    writeMonoPcm16Wav(outputDirectory / "synth-rerun.wav", secondPcm16, secondRateHz)

    measures = {
        "sentence": SENTENCE,
        "voice": VOICE_NAME,
        "voice_present_in_bank": True,
        "speed": SPEED,
        "language": LANGUAGE,
        "first": measureSamples(firstPcm16, firstRateHz),
        "rerun": measureSamples(secondPcm16, secondRateHz),
        "peak_abs_float32": float(np.max(np.abs(np.asarray(firstSamples, dtype=np.float32)))),
        "kokoro_onnx_version": importlib.metadata.version("kokoro-onnx"),
        "onnxruntime_version": importlib.metadata.version("onnxruntime"),
        "numpy_version": importlib.metadata.version("numpy"),
        "python_version": sys.version.split()[0],
    }
    (outputDirectory / "measures.json").write_text(
        json.dumps(measures, indent=2) + "\n", encoding="utf-8"
    )
    print(json.dumps(measures, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
