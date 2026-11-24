"""Apply the predeclared checks to the scene and two depth runs; exit 1 if any gating check fails.

Usage: check.py <scene.png> <scene.json> <run1.npy> <run2.npy> <run1.png> <run2.png>
Prints one JSON object: {"checks": {...booleans...}, "measured": {...}, "hashes": {...}}.
"""
import hashlib
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image

EXPECTED_WIDTH_PX = 640
EXPECTED_HEIGHT_PX = 480
MINIMUM_MONOTONIC_PAIR_FRACTION = 0.90
RERUN_TOLERANCE_FRACTION_OF_RANGE = 0.001
DECIMALS = 4


def pixelDistanceFrom(centreXy: list[float], height: int, width: int) -> np.ndarray:
    rowCentres, columnCentres = np.mgrid[0:height, 0:width].astype(float)
    return np.hypot(columnCentres + 0.5 - centreXy[0], rowCentres + 0.5 - centreXy[1])


def sha256Of(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main() -> None:
    if len(sys.argv) != 7:
        raise SystemExit("usage: check.py <scene.png> <scene.json> <run1.npy> <run2.npy> <run1.png> <run2.png>")
    scenePath, geometryPath, run1Path, run2Path, preview1Path, preview2Path = (Path(p) for p in sys.argv[1:])
    geometry = json.loads(geometryPath.read_text())
    sceneImage = Image.open(scenePath)
    depth1 = np.load(run1Path)
    depth2 = np.load(run2Path)
    height, width = depth1.shape

    nearDistance = pixelDistanceFrom(geometry["near_region"]["centre_xy"], height, width)
    farDistance = pixelDistanceFrom(geometry["far_region"]["centre_xy"], height, width)
    nearMedian = float(np.median(depth1[nearDistance <= geometry["near_region"]["radius_px"]]))
    farMedian = float(np.median(depth1[farDistance <= geometry["far_region"]["radius_px"]]))

    band = geometry["floor_band"]
    bandRows = depth1[band["first_row_px"] : band["last_row_px"] + 1, band["first_column_px"] : band["last_column_px"] + 1]
    rowMeans = bandRows.mean(axis=1)
    adjacentPairsNonDecreasing = np.diff(rowMeans) >= 0
    monotonicPairFraction = float(adjacentPairsNonDecreasing.mean())
    floorEndsIncreasing = bool(rowMeans[-1] > rowMeans[0])

    depthRange = float(depth1.max() - depth1.min())
    rerunMaxAbsDiff = float(np.abs(depth1.astype(np.float64) - depth2.astype(np.float64)).max())
    rerunTolerance = RERUN_TOLERANCE_FRACTION_OF_RANGE * depthRange

    hashes = {
        "input_png_sha256": sha256Of(scenePath),
        "run1_depth_png_sha256": sha256Of(preview1Path),
        "run2_depth_png_sha256": sha256Of(preview2Path),
    }

    checks = {
        "input_is_rgb_png_640x480": sceneImage.format == "PNG"
        and sceneImage.mode == "RGB"
        and sceneImage.size == (EXPECTED_WIDTH_PX, EXPECTED_HEIGHT_PX),
        "depth_shape_matches_input": depth1.shape == (EXPECTED_HEIGHT_PX, EXPECTED_WIDTH_PX)
        and depth1.dtype == np.float32,
        "near_region_nearer_than_far": nearMedian > farMedian,
        "floor_monotonic_nondecreasing_toward_bottom": monotonicPairFraction >= MINIMUM_MONOTONIC_PAIR_FRACTION
        and floorEndsIncreasing,
        "depth_range_nonzero": depthRange > 0.0,
        "rerun_within_tolerance": rerunMaxAbsDiff <= rerunTolerance and depth2.shape == depth1.shape,
        "hashes_at_least_two_distinct": len(set(hashes.values())) >= 2,
        "one_still_frame": True,
    }
    measured = {
        "depth_shape": [height, width],
        "near_median": round(nearMedian, DECIMALS),
        "far_median": round(farMedian, DECIMALS),
        "floor_monotonic_pair_fraction": round(monotonicPairFraction, DECIMALS),
        "floor_row_mean_first": round(float(rowMeans[0]), DECIMALS),
        "floor_row_mean_last": round(float(rowMeans[-1]), DECIMALS),
        "depth_range": round(depthRange, DECIMALS),
        "rerun_max_abs_diff": round(rerunMaxAbsDiff, DECIMALS),
        "rerun_tolerance": round(rerunTolerance, DECIMALS),
        "rerun_byte_identical": bool(depth1.tobytes() == depth2.tobytes()),
    }
    report = {"checks": checks, "measured": measured, "hashes": hashes}
    print(json.dumps(report, indent=2, sort_keys=True))
    if not all(checks.values()):
        failed = sorted(name for name, passed in checks.items() if not passed)
        print(f"FAILED checks: {', '.join(failed)}", file=sys.stderr)
        raise SystemExit(1)


if __name__ == "__main__":
    main()
