"""Trace one PNG to SVG with vtracer at the fixed settings below.

Usage: trace.py INPUT_PNG OUTPUT_SVG
Each call is one process, so run.sh can compare a fresh run with the first.
"""

import sys

import vtracer

TRACE_SETTINGS = {
    "colormode": "color",
    "hierarchical": "stacked",
    "mode": "spline",
    "filter_speckle": 4,
    "color_precision": 6,
    "layer_difference": 16,
    "corner_threshold": 60,
    "length_threshold": 4.0,
    "max_iterations": 10,
    "splice_threshold": 45,
    "path_precision": 8,
}


# === PUBLIC API ===

def main(argumentValues: list[str]) -> int:
    if len(argumentValues) != 3:
        print("usage: trace.py INPUT_PNG OUTPUT_SVG", file=sys.stderr)
        return 2
    inputPath, outputPath = argumentValues[1], argumentValues[2]
    vtracer.convert_image_to_svg_py(inputPath, outputPath, **TRACE_SETTINGS)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
