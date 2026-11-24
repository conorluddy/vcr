#!/usr/bin/env python3
"""Assert the libvips thumbnail and composite outputs against predeclared facts, then write metrics JSON."""
import hashlib
import json
import subprocess
import sys
from pathlib import Path

OUTPUT_SIZE = 1024
COLOUR_TOLERANCE = 3
ALPHA_TOLERANCE = 2

# (x, y, expected R G B A) fixed before running; see README "Plan, before running".
THUMBNAIL_PROBES = [
    (100, 100, (200, 30, 30, 255)),
    (800, 200, (30, 180, 60, 128)),
    (100, 800, (30, 60, 200, 255)),
    (800, 800, (240, 220, 40, 255)),
]
COMPOSITE_PROBES = THUMBNAIL_PROBES + [
    (300, 600, (30, 60, 200, 255)),
    (430, 730, (143, 158, 100, 255)),
    (530, 730, (248, 238, 20, 255)),
]


def runVips(arguments: list[str]) -> str:
    completed = subprocess.run(["vips", *arguments], capture_output=True, text=True, check=True)
    return completed.stdout.strip()


def readHeaderField(imagePath: Path, field: str) -> str:
    return subprocess.run(
        ["vipsheader", "-f", field, str(imagePath)], capture_output=True, text=True, check=True
    ).stdout.strip()


def readPixel(imagePath: Path, x: int, y: int) -> tuple[int, ...]:
    values = runVips(["getpoint", str(imagePath), str(x), str(y)]).split()
    return tuple(int(value) for value in values)


def assertProbes(imagePath: Path, probes: list[tuple[int, int, tuple[int, int, int, int]]]) -> list[dict]:
    observations = []
    for x, y, expected in probes:
        actual = readPixel(imagePath, x, y)
        assert len(actual) == 4, f"{imagePath.name} at ({x},{y}) has {len(actual)} bands, expected 4"
        for channel, (actualValue, expectedValue) in enumerate(zip(actual, expected)):
            tolerance = ALPHA_TOLERANCE if channel == 3 else COLOUR_TOLERANCE
            assert abs(actualValue - expectedValue) <= tolerance, (
                f"{imagePath.name} at ({x},{y}) channel {channel}: got {actual}, "
                f"expected {expected} within {tolerance}"
            )
        observations.append({"x": x, "y": y, "rgba": list(actual)})
    return observations


def assertImageShape(imagePath: Path) -> dict:
    width = int(readHeaderField(imagePath, "width"))
    height = int(readHeaderField(imagePath, "height"))
    bands = int(readHeaderField(imagePath, "bands"))
    assert (width, height) == (OUTPUT_SIZE, OUTPUT_SIZE), f"{imagePath.name} is {width}x{height}"
    assert bands == 4, f"{imagePath.name} has {bands} bands; alpha (4 bands) expected"
    return {"width": width, "height": height, "bands": bands}


def sha256Of(imagePath: Path) -> str:
    return hashlib.sha256(imagePath.read_bytes()).hexdigest()


# === PUBLIC API ===

def main(argv: list[str]) -> int:
    thumbnailPath, compositePath, versionPath, metricsPath = (Path(path) for path in argv[1:])
    thumbnailShape = assertImageShape(thumbnailPath)
    compositeShape = assertImageShape(compositePath)
    thumbnailObservations = assertProbes(thumbnailPath, THUMBNAIL_PROBES)
    compositeObservations = assertProbes(compositePath, COMPOSITE_PROBES)
    metrics = {
        "vips_version": versionPath.read_text(encoding="utf-8").strip(),
        "thumbnail": {
            **thumbnailShape,
            "sha256": sha256Of(thumbnailPath),
            "probes": thumbnailObservations,
        },
        "composite": {
            **compositeShape,
            "sha256": sha256Of(compositePath),
            "probes": compositeObservations,
        },
    }
    metricsPath.write_text(json.dumps(metrics, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
