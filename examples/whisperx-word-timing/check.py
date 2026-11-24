"""Apply the predeclared checks (README, "Predeclared checks") to one generated sentence.

Usage: check.py OUTPUT_DIR
Reads OUTPUT_DIR/{reference.json, input-ffprobe.json, run1.json, run2.json}.
Writes OUTPUT_DIR/{checks.json, timing.json, alignment.json}. Exits 1 if a gated check fails.
"""
import json
import os
import re
import sys
from dataclasses import dataclass
from typing import Optional

MAX_WORD_ERROR_RATE = 0.10
MIN_MATCHED_WORDS = 9
MAX_START_ERROR_S = 0.20
MAX_DURATION_ERROR_S = 0.02
EXPECTED_SAMPLE_RATE_HZ = 16000
EXPECTED_CHANNELS = 1
EXPECTED_CODEC = "pcm_s16le"


@dataclass(frozen=True)
class HypWord:
    normalised: str
    start: Optional[float]
    end: Optional[float]


@dataclass(frozen=True)
class RunResult:
    transcript: str
    wordErrors: int
    matchedCount: int
    matchedStartErrorsS: list[float]
    allMatchedTimed: bool


def normaliseWord(rawWord: str) -> str:
    return re.sub(r"[^a-z0-9]", "", rawWord.lower())


def loadJson(path: str) -> dict:
    with open(path, encoding="utf-8") as jsonFile:
        return json.load(jsonFile)


def toHypWords(rawWords: list[dict]) -> list[HypWord]:
    hypWords = []
    for rawWord in rawWords:
        normalised = normaliseWord(rawWord.get("word", ""))
        if normalised:
            hypWords.append(HypWord(normalised, rawWord.get("start"), rawWord.get("end")))
    return hypWords


def alignExactMatches(refWords: list[str], hypWords: list[str]) -> tuple[int, list[tuple[int, int]]]:
    """Levenshtein alignment; returns (edit count, pairs of reference/hypothesis indices that are equal)."""
    rows, cols = len(refWords) + 1, len(hypWords) + 1
    cost = [[0] * cols for _ in range(rows)]
    for i in range(rows):
        cost[i][0] = i
    for j in range(cols):
        cost[0][j] = j
    for i in range(1, rows):
        for j in range(1, cols):
            substitution = cost[i - 1][j - 1] + (0 if refWords[i - 1] == hypWords[j - 1] else 1)
            cost[i][j] = min(substitution, cost[i - 1][j] + 1, cost[i][j - 1] + 1)
    pairs: list[tuple[int, int]] = []
    i, j = len(refWords), len(hypWords)
    while i > 0 or j > 0:
        if i > 0 and j > 0 and refWords[i - 1] == hypWords[j - 1] and cost[i][j] == cost[i - 1][j - 1]:
            pairs.append((i - 1, j - 1))
            i, j = i - 1, j - 1
        elif i > 0 and j > 0 and cost[i][j] == cost[i - 1][j - 1] + 1:
            i, j = i - 1, j - 1
        elif i > 0 and cost[i][j] == cost[i - 1][j] + 1:
            i -= 1
        else:
            j -= 1
    pairs.reverse()
    return cost[len(refWords)][len(hypWords)], pairs


def scoreRun(reference: dict, runOutput: dict) -> RunResult:
    refWords = [normaliseWord(word) for word in reference["words"]]
    hypWords = toHypWords(runOutput["words"])
    editCount, pairs = alignExactMatches(refWords, [word.normalised for word in hypWords])
    startErrors: list[float] = []
    allTimed = True
    for refIndex, hypIndex in pairs:
        hypWord = hypWords[hypIndex]
        if hypWord.start is None or hypWord.end is None:
            allTimed = False
            continue
        startErrors.append(abs(hypWord.start - reference["startsS"][refIndex]))
    return RunResult(runOutput["transcript"], editCount, len(pairs), startErrors, allTimed)


def checkInputFormat(reference: dict, probe: dict) -> bool:
    stream = probe["streams"][0]
    durationS = float(probe["format"]["duration"])
    return (
        stream.get("codec_name") == EXPECTED_CODEC
        and int(stream.get("sample_rate", 0)) == EXPECTED_SAMPLE_RATE_HZ
        and int(stream.get("channels", 0)) == EXPECTED_CHANNELS
        and abs(durationS - reference["durationS"]) <= MAX_DURATION_ERROR_S
    )


def runGates(reference: dict, result: RunResult, runLabel: str) -> dict[str, bool]:
    wordCount = len(reference["words"])
    werValue = result.wordErrors / wordCount
    maxStartError = max(result.matchedStartErrorsS, default=float("inf"))
    return {
        f"{runLabel}_G2_word_error_rate_at_most_{MAX_WORD_ERROR_RATE}": werValue <= MAX_WORD_ERROR_RATE,
        f"{runLabel}_G3_matched_words_at_least_{MIN_MATCHED_WORDS}_all_timed": (
            result.matchedCount >= MIN_MATCHED_WORDS and result.allMatchedTimed
        ),
        f"{runLabel}_G4_matched_start_within_{MAX_START_ERROR_S}s": maxStartError <= MAX_START_ERROR_S,
    }


def buildTimingDetail(reference: dict, runs: dict[str, dict]) -> dict:
    perRun = {}
    for runLabel, runOutput in runs.items():
        result = scoreRun(reference, runOutput)
        errors = result.matchedStartErrorsS
        perRun[runLabel] = {
            "meanAbsStartErrorS": round(sum(errors) / len(errors), 4) if errors else None,
            "maxAbsStartErrorS": round(max(errors), 4) if errors else None,
            "wallSeconds": runOutput["wallSeconds"],
        }
    firstWords = runs["run1"]["words"]
    secondWords = runs["run2"]["words"]
    timingIdentical = [
        (round((word.get("start") or -1) * 1000), round((word.get("end") or -1) * 1000)) for word in firstWords
    ] == [
        (round((word.get("start") or -1) * 1000), round((word.get("end") or -1) * 1000)) for word in secondWords
    ]
    return {"perRun": perRun, "timingIdenticalTo1ms": timingIdentical, "versions": runs["run1"]["versions"]}


def buildAlignment(runOutput: dict) -> list[dict]:
    return [
        {
            "word": word.get("word"),
            "start": None if word.get("start") is None else round(word["start"], 2),
            "end": None if word.get("end") is None else round(word["end"], 2),
        }
        for word in runOutput["words"]
    ]


def main(argv: list[str]) -> None:
    if len(argv) != 2:
        sys.exit("usage: check.py OUTPUT_DIR")
    outputDir = argv[1]
    reference = loadJson(os.path.join(outputDir, "reference.json"))
    probe = loadJson(os.path.join(outputDir, "input-ffprobe.json"))
    runs = {label: loadJson(os.path.join(outputDir, f"{label}.json")) for label in ("run1", "run2")}

    results = {label: scoreRun(reference, runOutput) for label, runOutput in runs.items()}
    gates: dict[str, bool] = {"G1_input_format": checkInputFormat(reference, probe)}
    for label in runs:
        gates.update(runGates(reference, results[label], label))
    transcriptsIdentical = results["run1"].transcript == results["run2"].transcript
    normalisedIdentical = (
        [normaliseWord(word["word"]) for word in runs["run1"]["words"]]
        == [normaliseWord(word["word"]) for word in runs["run2"]["words"]]
    )
    gates["G5_transcript_identical_across_runs"] = transcriptsIdentical and normalisedIdentical
    allPass = all(gates.values())

    checks = {
        "gates": gates,
        "pass": allPass,
        "thresholds": {
            "maxWordErrorRate": MAX_WORD_ERROR_RATE,
            "minMatchedWords": MIN_MATCHED_WORDS,
            "maxStartErrorS": MAX_START_ERROR_S,
            "maxDurationErrorS": MAX_DURATION_ERROR_S,
        },
        "reference": {"sentence": reference["sentence"], "wordCount": len(reference["words"])},
        "runs": {
            label: {
                "transcript": result.transcript,
                "wordErrors": result.wordErrors,
                "matchedWords": result.matchedCount,
            }
            for label, result in results.items()
        },
    }
    timing = buildTimingDetail(reference, runs)
    with open(os.path.join(outputDir, "checks.json"), "w", encoding="utf-8") as file:
        json.dump(checks, file, indent=2)
        file.write("\n")
    with open(os.path.join(outputDir, "timing.json"), "w", encoding="utf-8") as file:
        json.dump(timing, file, indent=2)
        file.write("\n")
    with open(os.path.join(outputDir, "alignment.json"), "w", encoding="utf-8") as file:
        json.dump(buildAlignment(runs["run1"]), file, indent=2)
        file.write("\n")

    failed = [name for name, passed in gates.items() if not passed]
    if failed:
        sys.exit(f"gated checks failed: {', '.join(failed)}")


if __name__ == "__main__":
    main(sys.argv)
