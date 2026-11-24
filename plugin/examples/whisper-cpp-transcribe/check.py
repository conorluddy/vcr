"""Apply the predeclared checks (README, "Plan, before running") to two whisper-cli runs.

Usage: check.py OUTPUT_DIR MODEL_PATH SENTENCE
Reads OUTPUT_DIR/{input-ffprobe.json, run1.json, run2.json, run1.srt, run2.srt, run1.vtt,
run2.vtt, run1.log, run2.log}. Writes OUTPUT_DIR/{checks.json, segments.json, timing.json (informational, not diffed)}.
Exits 1 if a gated check fails.
"""
import hashlib
import json
import os
import re
import sys
from typing import Optional

EXPECTED_MODEL_SHA256 = "a03779c86df3323075f5e796cb2ce5029f00ec8869eee3fdfb897afe36c6d002"
MAX_WORD_ERROR_RATE = 0.10
EXPECTED_SAMPLE_RATE_HZ = 16000
EXPECTED_CHANNELS = 1
EXPECTED_CODEC = "pcm_s16le"
DURATION_TOLERANCE_MS = 50
TIMESTAMP_AGREEMENT_MS = 1
BACKEND_NAMES = ("Metal", "CPU")
BACKEND_IN_USE_PATTERN = re.compile(r"using (\S+) backend")
RUN_LABELS = ("run1", "run2")

SRT_CUE_PATTERN = re.compile(
    r"(\d{2}):(\d{2}):(\d{2}),(\d{3}) --> (\d{2}):(\d{2}):(\d{2}),(\d{3})"
)
VTT_CUE_PATTERN = re.compile(
    r"(\d{2}):(\d{2}):(\d{2})\.(\d{3}) --> (\d{2}):(\d{2}):(\d{2})\.(\d{3})"
)


def fail(message: str) -> None:
    sys.exit(f"check.py: {message}")


def normaliseWord(rawWord: str) -> str:
    return re.sub(r"[^a-z0-9]", "", rawWord.lower())


def loadJson(path: str) -> dict:
    if not os.path.exists(path):
        fail(f"missing {path}; run.sh must produce it before check.py runs")
    with open(path, encoding="utf-8") as jsonFile:
        return json.load(jsonFile)


def loadText(path: str) -> str:
    if not os.path.exists(path):
        fail(f"missing {path}; run.sh must produce it before check.py runs")
    with open(path, encoding="utf-8") as textFile:
        return textFile.read()


def sha256OfFile(path: str) -> str:
    digest = hashlib.sha256()
    with open(path, "rb") as binaryFile:
        for block in iter(lambda: binaryFile.read(1 << 20), b""):
            digest.update(block)
    return digest.hexdigest()


def editDistance(referenceWords: list[str], hypothesisWords: list[str]) -> int:
    previousRow = list(range(len(hypothesisWords) + 1))
    for referenceIndex, referenceWord in enumerate(referenceWords, start=1):
        currentRow = [referenceIndex]
        for hypothesisIndex, hypothesisWord in enumerate(hypothesisWords, start=1):
            substitutionCost = 0 if referenceWord == hypothesisWord else 1
            currentRow.append(
                min(
                    previousRow[hypothesisIndex - 1] + substitutionCost,
                    previousRow[hypothesisIndex] + 1,
                    currentRow[hypothesisIndex - 1] + 1,
                )
            )
        previousRow = currentRow
    return previousRow[-1]


def segmentsFromJson(runOutput: dict) -> list[dict]:
    transcription = runOutput.get("transcription")
    if not isinstance(transcription, list) or not transcription:
        fail("JSON has no transcription segments; whisper-cli produced an empty result")
    segments = []
    for entry in transcription:
        offsets = entry["offsets"]
        segments.append({"fromMs": int(offsets["from"]), "toMs": int(offsets["to"]), "text": entry["text"].strip()})
    return segments


def cuesFromSubtitleText(subtitleText: str, pattern: re.Pattern[str]) -> list[tuple[int, int]]:
    cues = []
    for match in pattern.finditer(subtitleText):
        hours1, minutes1, seconds1, millis1, hours2, minutes2, seconds2, millis2 = map(int, match.groups())
        startMs = ((hours1 * 60 + minutes1) * 60 + seconds1) * 1000 + millis1
        endMs = ((hours2 * 60 + minutes2) * 60 + seconds2) * 1000 + millis2
        cues.append((startMs, endMs))
    return cues


def cuesAgree(cues: list[tuple[int, int]], segments: list[dict]) -> bool:
    if len(cues) != len(segments):
        return False
    return all(
        abs(cueStart - segment["fromMs"]) <= TIMESTAMP_AGREEMENT_MS
        and abs(cueEnd - segment["toMs"]) <= TIMESTAMP_AGREEMENT_MS
        for (cueStart, cueEnd), segment in zip(cues, segments)
    )


def timingsInBoundsAndOrdered(segments: list[dict], durationMs: float) -> bool:
    inBounds = all(
        0 <= segment["fromMs"] < segment["toMs"] <= durationMs + DURATION_TOLERANCE_MS for segment in segments
    )
    fromsOrdered = all(later["fromMs"] >= earlier["fromMs"] for earlier, later in zip(segments, segments[1:]))
    tosOrdered = all(later["toMs"] >= earlier["toMs"] for earlier, later in zip(segments, segments[1:]))
    return inBounds and fromsOrdered and tosOrdered


def backendNamesFromLog(logText: str) -> list[str]:
    """Names of the backends whisper-cli reports in use ("using MTL0 backend" maps to Metal)."""
    names: list[str] = []
    for match in BACKEND_IN_USE_PATTERN.finditer(logText):
        rawName = match.group(1)
        name = "Metal" if rawName.startswith("MTL") else rawName
        if name not in names:
            names.append(name)
    return names


def main(argv: list[str]) -> None:
    if len(argv) != 4:
        sys.exit("usage: check.py OUTPUT_DIR MODEL_PATH SENTENCE")
    outputDir, modelPath, sentence = argv[1], argv[2], argv[3]

    probe = loadJson(os.path.join(outputDir, "input-ffprobe.json"))
    if not os.path.exists(modelPath):
        fail(f"missing model {modelPath}; download it as README.md describes")
    modelSha256 = sha256OfFile(modelPath)
    durationMs = float(probe["format"]["duration"]) * 1000
    stream = probe["streams"][0]
    referenceWords = [normaliseWord(word) for word in sentence.split() if normaliseWord(word)]

    runs: dict[str, dict] = {}
    for label in RUN_LABELS:
        runOutput = loadJson(os.path.join(outputDir, f"{label}.json"))
        segments = segmentsFromJson(runOutput)
        srtCues = cuesFromSubtitleText(loadText(os.path.join(outputDir, f"{label}.srt")), SRT_CUE_PATTERN)
        vttText = loadText(os.path.join(outputDir, f"{label}.vtt"))
        vttCues = cuesFromSubtitleText(vttText, VTT_CUE_PATTERN)
        transcript = " ".join(segment["text"] for segment in segments)
        hypothesisWords = [normaliseWord(word) for word in transcript.split() if normaliseWord(word)]
        wordErrors = editDistance(referenceWords, hypothesisWords)
        runs[label] = {
            "segments": segments,
            "transcript": transcript,
            "normalisedWords": hypothesisWords,
            "wordErrors": wordErrors,
            "wordErrorRate": round(wordErrors / len(referenceWords), 4),
            "vttHeaderOk": vttText.startswith("WEBVTT"),
            "srtAgrees": cuesAgree(srtCues, segments),
            "vttAgrees": cuesAgree(vttCues, segments),
            "srtCueCount": len(srtCues),
            "vttCueCount": len(vttCues),
            "timingsOk": timingsInBoundsAndOrdered(segments, durationMs),
            "backendNames": backendNamesFromLog(loadText(os.path.join(outputDir, f"{label}.log"))),
        }

    gates: dict[str, bool] = {
        "G0_model_sha256": modelSha256 == EXPECTED_MODEL_SHA256,
        "G1_input_format": stream.get("codec_name") == EXPECTED_CODEC
        and int(stream.get("sample_rate", 0)) == EXPECTED_SAMPLE_RATE_HZ
        and int(stream.get("channels", 0)) == EXPECTED_CHANNELS,
    }
    for label in RUN_LABELS:
        run = runs[label]
        gates[f"G2_{label}_word_error_rate_at_most_{MAX_WORD_ERROR_RATE}"] = run["wordErrorRate"] <= MAX_WORD_ERROR_RATE
        gates[f"G3_{label}_outputs_json_srt_vtt_agree"] = (
            run["srtAgrees"] and run["vttAgrees"] and run["vttHeaderOk"]
        )
        gates[f"G4_{label}_segments_inside_duration"] = run["timingsOk"]
        gates[f"G6_{label}_backend_metal_or_cpu_in_use"] = any(
            name in BACKEND_NAMES for name in run["backendNames"]
        )
    gates["G5_run1_segments_in_order"] = runs["run1"]["timingsOk"]
    gates["G7_text_identical_across_runs"] = (
        runs["run1"]["transcript"] == runs["run2"]["transcript"]
        and runs["run1"]["normalisedWords"] == runs["run2"]["normalisedWords"]
    )
    allPass = all(gates.values())

    informational = {
        "segmentOffsetsIdenticalMs": runs["run1"]["segments"] == runs["run2"]["segments"],
        "srtIdenticalAcrossRuns": loadText(os.path.join(outputDir, "run1.srt"))
        == loadText(os.path.join(outputDir, "run2.srt")),
        "vttIdenticalAcrossRuns": loadText(os.path.join(outputDir, "run1.vtt"))
        == loadText(os.path.join(outputDir, "run2.vtt")),
    }

    checks = {
        "gates": gates,
        "pass": allPass,
        "thresholds": {
            "modelSha256": EXPECTED_MODEL_SHA256,
            "maxWordErrorRate": MAX_WORD_ERROR_RATE,
            "durationToleranceMs": DURATION_TOLERANCE_MS,
            "timestampAgreementMs": TIMESTAMP_AGREEMENT_MS,
        },
        "reference": {"sentence": sentence, "wordCount": len(referenceWords)},
        "input": {"codec": stream.get("codec_name"), "sampleRateHz": stream.get("sample_rate"),
                  "channels": stream.get("channels")},
        "runs": {
            label: {
                "transcript": run["transcript"],
                "wordErrors": run["wordErrors"],
                "wordErrorRate": run["wordErrorRate"],
                "segmentCount": len(run["segments"]),
                "backendNames": run["backendNames"],
            }
            for label, run in runs.items()
        },
    }
    with open(os.path.join(outputDir, "checks.json"), "w", encoding="utf-8") as file:
        json.dump(checks, file, indent=2)
        file.write("\n")
    with open(os.path.join(outputDir, "timing.json"), "w", encoding="utf-8") as file:
        json.dump(informational, file, indent=2)
        file.write("\n")
    with open(os.path.join(outputDir, "segments.json"), "w", encoding="utf-8") as file:
        json.dump(runs["run1"]["segments"], file, indent=2)
        file.write("\n")

    failed = [name for name, passed in gates.items() if not passed]
    if failed:
        sys.exit(f"gated checks failed: {', '.join(failed)}")


if __name__ == "__main__":
    main(sys.argv)
