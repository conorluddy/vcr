# === FIXTURE PARAMETERS (shared by generate_input.py and check.py) ===
# Predeclared values. The workflow (workflow.json) must use the same numbers.
from typing import Final

import numpy as np

INPUT_FILENAME: Final = "vcr-fixture-input.png"
INPUT_WIDTH_PX: Final = 64
INPUT_HEIGHT_PX: Final = 48
OUTPUT_WIDTH_PX: Final = 128
OUTPUT_HEIGHT_PX: Final = 96
FILENAME_PREFIX: Final = "vcr-fixture"
BLEND_FACTOR: Final = 0.5
FILL_COLOUR_RGB: Final = (0x33, 0x66, 0xCC)
PIXEL_TOLERANCE: Final = 1

# Input quadrants: (x range, y range) in input pixels, and the RGB colour painted there.
QUADRANTS_INPUT: Final = {
    "top_left": ((0, 32), (0, 24), (200, 50, 30)),
    "top_right": ((32, 64), (0, 24), (10, 120, 220)),
    "bottom_left": ((0, 32), (24, 48), (90, 200, 40)),
    "bottom_right": ((32, 64), (24, 48), (240, 240, 240)),
}

# Probe points in output pixels: the centre of each 64x48 output quadrant (2x nearest scale).
PROBE_POINTS_OUTPUT: Final = {
    "top_left": (32, 24),
    "top_right": (96, 24),
    "bottom_left": (32, 72),
    "bottom_right": (96, 72),
}


def generate_input_array() -> np.ndarray:
    """Returns the input as a (height, width, 3) uint8 array, from the quadrant table only."""
    image = np.zeros((INPUT_HEIGHT_PX, INPUT_WIDTH_PX, 3), dtype=np.uint8)
    for (x_start, x_end), (y_start, y_end), colour_rgb in QUADRANTS_INPUT.values():
        image[y_start:y_end, x_start:x_end] = colour_rgb
    return image


def predicted_output_rgb_at_probes() -> dict[str, tuple[float, float, float]]:
    """Predicted (unrounded) output RGB at each probe: invert, then normal blend at factor 0.5 with the fill."""
    input_image = generate_input_array()
    predicted: dict[str, tuple[float, float, float]] = {}
    for name, (output_x, output_y) in PROBE_POINTS_OUTPUT.items():
        input_x, input_y = output_x // 2, output_y // 2
        inverted = 255.0 - input_image[input_y, input_x].astype(np.float64)
        blended = inverted * (1.0 - BLEND_FACTOR) + np.array(FILL_COLOUR_RGB, dtype=np.float64) * BLEND_FACTOR
        predicted[name] = (float(blended[0]), float(blended[1]), float(blended[2]))
    return predicted
