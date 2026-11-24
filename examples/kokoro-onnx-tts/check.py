"""Checks the two synthesis runs against the predeclared facts in README.md.

Usage: check.py PROCESS1_DIR PROCESS2_DIR
Prints one JSON object. Exit 1 if a gating check fails.
"""

import json
import sys
import wave
from pathlib import Path

EXPECTED_SAMPLE_RATE_HZ = 24000
DURATION_MIN_S = 1.5
DURATION_MAX_S = 4.0
RMS_FLOOR_FULL_SCALE = 0.001  # silence floor only, not a loudness target


def readWavHeader(wavPath: Path) -> dict[str, int]:
    with wave.open(str(wavPath), "rb") as wavFile:
        return {
            "channels": wavFile.getnchannels(),
            "sample_width_bytes": wavFile.getsampwidth(),
            "sample_rate_hz": wavFile.getframerate(),
            "frame_count": wavFile.getnframes(),
        }


def loadMeasures(runDirectory: Path) -> dict[str, object]:
    return json.loads((runDirectory / "measures.json").read_text(encoding="utf-8"))


def main(argv: list[str]) -> int:
    if len(argv) != 3:
        print("usage: check.py PROCESS1_DIR PROCESS2_DIR", file=sys.stderr)
        return 2
    firstRunDirectory = Path(argv[1])
    secondRunDirectory = Path(argv[2])
    firstMeasures = loadMeasures(firstRunDirectory)
    secondMeasures = loadMeasures(secondRunDirectory)
    firstFileHeader = readWavHeader(firstRunDirectory / "synth.wav")
    rerunFileHeader = readWavHeader(firstRunDirectory / "synth-rerun.wav")
    processTwoFileHeader = readWavHeader(secondRunDirectory / "synth.wav")

    firstStats = firstMeasures["first"]
    gating = {
        "sample_rate_is_24000_hz": firstStats["sample_rate_hz"] == EXPECTED_SAMPLE_RATE_HZ
        and firstFileHeader["sample_rate_hz"] == EXPECTED_SAMPLE_RATE_HZ
        and processTwoFileHeader["sample_rate_hz"] == EXPECTED_SAMPLE_RATE_HZ,
        "mono_16bit_wav": all(
            header["channels"] == 1 and header["sample_width_bytes"] == 2
            for header in (firstFileHeader, rerunFileHeader, processTwoFileHeader)
        ),
        "file_frames_match_library_output": firstFileHeader["frame_count"]
        == firstStats["frame_count"]
        and rerunFileHeader["frame_count"] == firstMeasures["rerun"]["frame_count"],
        "duration_in_predeclared_range": DURATION_MIN_S
        <= firstStats["duration_s"]
        <= DURATION_MAX_S,
        "non_silent_above_floor": firstStats["rms_full_scale"] > RMS_FLOOR_FULL_SCALE,
        "voice_present_in_bank": firstMeasures["voice_present_in_bank"] is True,
    }
    repeats = {
        "in_process_rerun_pcm_identical": firstStats["pcm16_sha256"]
        == firstMeasures["rerun"]["pcm16_sha256"],
        "cross_process_pcm_identical": firstStats["pcm16_sha256"]
        == secondMeasures["first"]["pcm16_sha256"],
    }
    result = {
        "gating": gating,
        "repeats_recorded_not_gating": repeats,
        "measures": {
            "sentence": firstMeasures["sentence"],
            "voice": firstMeasures["voice"],
            "speed": firstMeasures["speed"],
            "language": firstMeasures["language"],
            "sample_rate_hz": firstStats["sample_rate_hz"],
            "frame_count": firstStats["frame_count"],
            "kokoro_onnx_version": firstMeasures["kokoro_onnx_version"],
            "onnxruntime_version": firstMeasures["onnxruntime_version"],
            "numpy_version": firstMeasures["numpy_version"],
            "python_version": firstMeasures["python_version"],
        },
    }
    # Values that vary between runs (durations, RMS, peaks, PCM hashes) stay in
    # PROCESS_DIR/measures.json; only stable facts are diffed against expected/.
    print(json.dumps(result, indent=2, sort_keys=True))
    return 0 if all(gating.values()) else 1


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
