"""Transcribe one WAV with WhisperX (tiny.en, CPU, int8) and write word-aligned JSON.

Usage: transcribe.py INPUT_WAV OUTPUT_JSON
Diarization is not run. Each invocation is a separate process, so reruns start cold.
"""
import json
import sys
import time
from importlib.metadata import version

import whisperx

MODEL_NAME = "tiny.en"
DEVICE = "cpu"
COMPUTE_TYPE = "int8"
LANGUAGE = "en"
BATCH_SIZE = 8


def main(argv: list[str]) -> None:
    if len(argv) != 3:
        sys.exit("usage: transcribe.py INPUT_WAV OUTPUT_JSON")
    inputPath, outputPath = argv[1], argv[2]

    startedAt = time.perf_counter()
    audio = whisperx.load_audio(inputPath)
    model = whisperx.load_model(MODEL_NAME, DEVICE, compute_type=COMPUTE_TYPE, language=LANGUAGE)
    transcription = model.transcribe(audio, batch_size=BATCH_SIZE)
    alignModel, alignMetadata = whisperx.load_align_model(language_code=LANGUAGE, device=DEVICE)
    aligned = whisperx.align(
        transcription["segments"], alignModel, alignMetadata, audio, DEVICE, return_char_alignments=False
    )
    wallSeconds = time.perf_counter() - startedAt

    segmentTexts = [segment["text"].strip() for segment in transcription["segments"]]
    words = [
        {
            "word": wordSegment.get("word", ""),
            "start": wordSegment.get("start"),
            "end": wordSegment.get("end"),
            "score": wordSegment.get("score"),
        }
        for wordSegment in aligned.get("word_segments", [])
    ]
    result = {
        "model": MODEL_NAME,
        "device": DEVICE,
        "computeType": COMPUTE_TYPE,
        "language": transcription.get("language"),
        "transcript": " ".join(segmentTexts),
        "words": words,
        "wallSeconds": round(wallSeconds, 3),
        "versions": {
            "whisperx": version("whisperx"),
            "faster-whisper": version("faster-whisper"),
            "torch": version("torch"),
            "torchaudio": version("torchaudio"),
        },
    }
    with open(outputPath, "w", encoding="utf-8") as outputFile:
        json.dump(result, outputFile, indent=2)
        outputFile.write("\n")


if __name__ == "__main__":
    main(sys.argv)
