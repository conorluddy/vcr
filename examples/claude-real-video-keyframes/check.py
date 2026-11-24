"""Gate claude-real-video keyframes against the predeclared three-shot clip.

Usage: check.py OUTPUT_DIR. Reads output/probe.json and output/run-a, output/run-b.
Prints a deterministic JSON document (no paths, timings or hashes) and exits 1
if any gating check fails.
"""

import glob
import json
import os
import sys
from fractions import Fraction

from PIL import Image

FPS = 24
FRAME_TOLERANCE = 1
EXPECTED_FRAME_COUNT = 144
EXPECTED_WIDTH = 320
EXPECTED_HEIGHT = 240
AUTHORED_KEYFRAME_INDICES = [0, 48, 96]
EXPECTED_KEYFRAME_COUNT = 3


def readClipProbe(probePath: str) -> dict:
    with open(probePath, encoding="utf-8") as handle:
        stream = json.load(handle)["streams"][0]
    return {
        "frameCount": int(stream["nb_read_frames"]),
        "width": int(stream["width"]),
        "height": int(stream["height"]),
        "frameRate": stream["avg_frame_rate"],
    }


def readRunOutput(runDirectory: str) -> dict:
    with open(os.path.join(runDirectory, "frames.json"), encoding="utf-8") as handle:
        frames = json.load(handle)["frames"]
    keyframeIndices = [round(frame["timestamp_sec"] * FPS) for frame in frames]
    dimensions = []
    for frame in frames:
        with Image.open(os.path.join(runDirectory, "frames", frame["file"])) as image:
            dimensions.append([image.width, image.height])
    return {
        "keyframeFiles": [frame["file"] for frame in frames],
        "keyframeIndices": keyframeIndices,
        "selectionReasons": [frame["selection_reason"] for frame in frames],
        "dimensions": dimensions,
        "fileCountOnDisk": len(glob.glob(os.path.join(runDirectory, "frames", "frame_*.jpg"))),
        "framesJson": frames,
    }


def boundaryFramesFrom(keyframeIndices: list[int]) -> list[int]:
    return keyframeIndices[1:]


def withinTolerance(actual: list[int], authored: list[int]) -> bool:
    if len(actual) != len(authored):
        return False
    return all(abs(a - b) <= FRAME_TOLERANCE for a, b in zip(actual, authored))


def main(outputDirectory: str) -> int:
    clip = readClipProbe(os.path.join(outputDirectory, "probe.json"))
    runA = readRunOutput(os.path.join(outputDirectory, "run-a"))
    runB = readRunOutput(os.path.join(outputDirectory, "run-b"))

    gates = {
        "clipFrameCount144": clip["frameCount"] == EXPECTED_FRAME_COUNT,
        "clipDimensions320x240": clip["width"] == EXPECTED_WIDTH and clip["height"] == EXPECTED_HEIGHT,
        "clipRate24fps": Fraction(clip["frameRate"]) == FPS,
        "runAKeyframeCount3": len(runA["keyframeIndices"]) == EXPECTED_KEYFRAME_COUNT,
        "runBKeyframeCount3": len(runB["keyframeIndices"]) == EXPECTED_KEYFRAME_COUNT,
        "runAFilesMatchFramesJson": runA["fileCountOnDisk"] == len(runA["keyframeIndices"]),
        "runBFilesMatchFramesJson": runB["fileCountOnDisk"] == len(runB["keyframeIndices"]),
        "runAKeyframeDimensions320x240": all(d == [EXPECTED_WIDTH, EXPECTED_HEIGHT] for d in runA["dimensions"]),
        "runBKeyframeDimensions320x240": all(d == [EXPECTED_WIDTH, EXPECTED_HEIGHT] for d in runB["dimensions"]),
        "runAKeyframesWithinTolerance": withinTolerance(runA["keyframeIndices"], AUTHORED_KEYFRAME_INDICES),
        "runBKeyframesWithinTolerance": withinTolerance(runB["keyframeIndices"], AUTHORED_KEYFRAME_INDICES),
        "rerunBoundariesIdentical": boundaryFramesFrom(runA["keyframeIndices"]) == boundaryFramesFrom(runB["keyframeIndices"]),
        "rerunFramesJsonIdentical": runA["framesJson"] == runB["framesJson"],
    }
    document = {
        "clip": clip,
        "authoredKeyframeIndices": AUTHORED_KEYFRAME_INDICES,
        "toleranceFrames": FRAME_TOLERANCE,
        "runA": {k: runA[k] for k in ("keyframeIndices", "selectionReasons", "dimensions")},
        "runB": {k: runB[k] for k in ("keyframeIndices", "selectionReasons", "dimensions")},
        "gates": gates,
        "pass": all(gates.values()),
    }
    print(json.dumps(document, indent=2, sort_keys=True))
    return 0 if document["pass"] else 1


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit("usage: check.py OUTPUT_DIR")
    sys.exit(main(sys.argv[1]))
