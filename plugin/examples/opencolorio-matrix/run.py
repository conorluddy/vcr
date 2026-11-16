import hashlib
import json
import struct
import sys
from pathlib import Path

import PyOpenColorIO as ocio

ROOT = Path(__file__).parent
INPUT_PIXELS = [
    [0.2, 0.4, 0.1],
    [0.8, 0.1, 0.2],
    [0.3, 0.6, 0.4],
    [0.1, 0.5, 0.2],
]
EXPECTED_PIXELS = [
    [0.25, 0.5, 0.24],
    [0.475, 0.05, 0.5],
    [0.35, 0.8, 0.85],
    [0.225, 0.65, 0.43],
]
MATRIX = [
    0.5, 0.25, 0.0, 0.0,
    0.0, 1.5, 0.0, 0.0,
    0.1, 0.0, 2.0, 0.0,
    0.0, 0.0, 0.0, 1.0,
]
OFFSETS = [0.05, -0.1, 0.02, 0.0]
TOLERANCE = 1e-6


def apply_transform():
    config = ocio.Config.CreateRaw()
    transform = ocio.MatrixTransform()
    transform.setMatrix(MATRIX)
    transform.setOffset(OFFSETS)
    processor = config.getProcessor(transform).getDefaultCPUProcessor()
    packed_rgb = [component for pixel in INPUT_PIXELS for component in pixel]
    return processor.applyRGB(packed_rgb)


def pack_float32(values):
    return b"".join(struct.pack("<f", value) for value in values)


def main():
    output_values = apply_transform()
    repeated_values = apply_transform()
    output_pixels = [output_values[i:i + 3] for i in range(0, len(output_values), 3)]
    maximum_error = max(
        abs(actual - expected)
        for actual_pixel, expected_pixel in zip(output_pixels, EXPECTED_PIXELS)
        for actual, expected in zip(actual_pixel, expected_pixel)
    )
    if len(output_pixels) != len(EXPECTED_PIXELS) or maximum_error > TOLERANCE:
        raise AssertionError(f"OCIO output differs from declared matrix results: max error {maximum_error}")
    if output_values != repeated_values:
        raise AssertionError("Independent OpenColorIO CPU processor runs differ")

    metrics = {
        "opencolorio_version": ocio.GetVersion(),
        "transform": "Config.CreateRaw + MatrixTransform + default CPUProcessor.applyRGB",
        "input_rgb": INPUT_PIXELS,
        "expected_rgb": EXPECTED_PIXELS,
        "output_rgb": output_pixels,
        "max_abs_error": maximum_error,
        "packed_float32_output_sha256": hashlib.sha256(pack_float32(output_values)).hexdigest(),
        "independent_run_matches": output_values == repeated_values,
    }

    output_dir = ROOT / "output"
    output_dir.mkdir(exist_ok=True)
    (output_dir / "metrics.json").write_text(json.dumps(metrics, indent=2) + "\n")

    if "--record" in sys.argv[1:]:
        expected_dir = ROOT / "expected"
        expected_dir.mkdir(exist_ok=True)
        (expected_dir / "metrics.json").write_text(json.dumps(metrics, indent=2) + "\n")
    else:
        expected = json.loads((ROOT / "expected" / "metrics.json").read_text())
        if metrics != expected:
            raise AssertionError("Observed metrics differ from expected/metrics.json")

    print(json.dumps(metrics, indent=2))
    print("opencolorio-matrix: OK")


if __name__ == "__main__":
    main()
