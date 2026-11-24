"""Evaluate the predeclared Rhubarb mouth-cue checks C1-C8 and write normalised copies for expected/.

Usage: check.py OUTPUT_DIR
Reads reference.json, input-ffprobe.json and the four Rhubarb runs (plain and dialog, two each).
Writes checks.json, normalised-plain.json and normalised-dialog.json into OUTPUT_DIR.
Exits 1 and lists every failed check when any predeclared check fails.
"""
import hashlib
import json
import os
import sys
from typing import Callable, Dict, List

DOCUMENTED_SHAPES = set("ABCDEFGHX")
REST_SHAPE = "X"
GAP_X_MIN_FRACTION = 0.80
SPEECH_NON_REST_MIN_FRACTION = 0.75
DURATION_TOLERANCE_S = 0.011
FFPROBE_TOLERANCE_S = 0.001
TILING_TOLERANCE_S = 1e-6
RUN_FILES = {
    "plain-run1": "plain-run1.json",
    "plain-run2": "plain-run2.json",
    "dialog-run1": "dialog-run1.json",
    "dialog-run2": "dialog-run2.json",
}


def loadJson(jsonPath: str) -> dict:
    with open(jsonPath, encoding="utf-8") as jsonFile:
        return json.load(jsonFile)


def sha256OfBytes(content: bytes) -> str:
    return hashlib.sha256(content).hexdigest()


def normaliseRunOutput(runOutput: dict) -> dict:
    # soundFile is an absolute path on the machine that ran the fixture; keep only its basename.
    metadata = dict(runOutput["metadata"])
    metadata["soundFile"] = os.path.basename(metadata["soundFile"])
    return {"metadata": metadata, "mouthCues": runOutput["mouthCues"]}


def overlapSeconds(cueStartS: float, cueEndS: float, intervalStartS: float, intervalEndS: float) -> float:
    return max(0.0, min(cueEndS, intervalEndS) - max(cueStartS, intervalStartS))


def coveredFraction(cues: List[dict], intervalStartS: float, intervalEndS: float,
                    isCounted: Callable[[str], bool]) -> float:
    coveredS = sum(overlapSeconds(cue["start"], cue["end"], intervalStartS, intervalEndS)
                   for cue in cues if isCounted(cue["value"]))
    return coveredS / (intervalEndS - intervalStartS)


def checkCueTiling(cues: List[dict], durationS: float) -> List[str]:
    failures: List[str] = []
    if not cues:
        return ["C1 mouthCues is empty"]
    if abs(cues[0]["start"]) > TILING_TOLERANCE_S:
        failures.append(f"C3 first cue starts at {cues[0]['start']}, expected 0.00")
    for index, cue in enumerate(cues):
        if not cue["start"] < cue["end"]:
            failures.append(f"C3 cue {index} has start {cue['start']} not before end {cue['end']}")
        if index + 1 < len(cues):
            nextCue = cues[index + 1]
            if not cue["start"] < nextCue["start"]:
                failures.append(f"C3 cue {index + 1} starts at {nextCue['start']}, not after {cue['start']}")
            if abs(cue["end"] - nextCue["start"]) > TILING_TOLERANCE_S:
                failures.append(f"C3 gap or overlap between cue {index} end {cue['end']} "
                                f"and cue {index + 1} start {nextCue['start']}")
        if cue["value"] not in DOCUMENTED_SHAPES:
            failures.append(f"C4 cue {index} uses undocumented shape {cue['value']!r}")
    if abs(cues[-1]["end"] - durationS) > TILING_TOLERANCE_S:
        failures.append(f"C3 last cue ends at {cues[-1]['end']}, metadata.duration is {durationS}")
    return failures


def checkRun(runOutput: dict, reference: dict, ffprobeDurationS: float) -> dict:
    failures: List[str] = []
    cues = runOutput["mouthCues"]
    durationS = runOutput["metadata"]["duration"]
    if abs(durationS - ffprobeDurationS) > DURATION_TOLERANCE_S:
        failures.append(f"C2 metadata.duration {durationS} differs from ffprobe {ffprobeDurationS}")
    failures.extend(checkCueTiling(cues, durationS))

    gapFractions = [coveredFraction(cues, startS, endS, lambda value: value == REST_SHAPE)
                    for startS, endS in reference["silentGapsS"]]
    for gapIndex, fraction in enumerate(gapFractions):
        if fraction < GAP_X_MIN_FRACTION:
            failures.append(f"C5 gap {gapIndex} is X for {fraction:.3f} of its length, "
                            f"needs at least {GAP_X_MIN_FRACTION}")

    speechFractions = [coveredFraction(cues, startS, endS, lambda value: value != REST_SHAPE)
                       for startS, endS in reference["speechSpansS"]]
    for spanIndex, fraction in enumerate(speechFractions):
        if fraction < SPEECH_NON_REST_MIN_FRACTION:
            failures.append(f"C6 speech span {spanIndex} is non-X for {fraction:.3f} of its length, "
                            f"needs at least {SPEECH_NON_REST_MIN_FRACTION}")

    return {
        "normalisedSha256": sha256OfBytes(
            json.dumps(normaliseRunOutput(runOutput), sort_keys=True).encode("utf-8")),
        "durationS": durationS,
        "cueCount": len(cues),
        "shapesUsed": sorted({cue["value"] for cue in cues}),
        "gapXFractions": [round(fraction, 4) for fraction in gapFractions],
        "speechNonXFractions": [round(fraction, 4) for fraction in speechFractions],
        "failures": failures,
    }


def readRunBytes(outputDir: str, runFileName: str) -> bytes:
    with open(os.path.join(outputDir, runFileName), "rb") as runFile:
        return runFile.read()


def main(argv: List[str]) -> None:
    if len(argv) != 2:
        sys.exit("usage: check.py OUTPUT_DIR")
    outputDir = argv[1]
    reference = loadJson(os.path.join(outputDir, "reference.json"))
    ffprobeDurationS = float(loadJson(os.path.join(outputDir, "input-ffprobe.json"))["format"]["duration"])
    failures: List[str] = []
    if abs(ffprobeDurationS - reference["durationS"]) > FFPROBE_TOLERANCE_S:
        failures.append(f"C2 ffprobe duration {ffprobeDurationS} differs from reference {reference['durationS']}")

    runs: Dict[str, dict] = {}
    rawBytesByLabel: Dict[str, bytes] = {}
    for runLabel, runFileName in RUN_FILES.items():
        rawBytes = readRunBytes(outputDir, runFileName)
        rawBytesByLabel[runLabel] = rawBytes
        runOutput = json.loads(rawBytes.decode("utf-8"))
        runs[runLabel] = checkRun(runOutput, reference, ffprobeDurationS)
        failures.extend(f"{runLabel}: {failure}" for failure in runs[runLabel]["failures"])

    deterministic = {
        "plain": rawBytesByLabel["plain-run1"] == rawBytesByLabel["plain-run2"],
        "dialog": rawBytesByLabel["dialog-run1"] == rawBytesByLabel["dialog-run2"],
    }
    for mode, isSame in deterministic.items():
        if not isSame:
            failures.append(f"C7 {mode} reruns are not byte-identical")

    checks = {
        "referenceDurationS": reference["durationS"],
        "ffprobeDurationS": ffprobeDurationS,
        "deterministic": deterministic,
        "runs": runs,
        "passed": not failures,
    }
    with open(os.path.join(outputDir, "checks.json"), "w", encoding="utf-8") as checksFile:
        json.dump(checks, checksFile, indent=2, sort_keys=True)
        checksFile.write("\n")
    for mode in ("plain", "dialog"):
        normalisedRun = normaliseRunOutput(json.loads(rawBytesByLabel[f"{mode}-run1"].decode("utf-8")))
        with open(os.path.join(outputDir, f"normalised-{mode}.json"), "w", encoding="utf-8") as normalisedFile:
            json.dump(normalisedRun, normalisedFile, indent=2)
            normalisedFile.write("\n")

    if failures:
        for failure in failures:
            print(f"FAILED {failure}", file=sys.stderr)
        sys.exit(1)
    print("checks: all predeclared checks C1-C8 passed")


if __name__ == "__main__":
    main(sys.argv)
