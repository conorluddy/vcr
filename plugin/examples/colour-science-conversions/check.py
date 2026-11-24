"""colour-science conversions fixture: Lab/OKLab round trip, white point, CIEDE2000 and BT.2020 matrix.

Prints one JSON document to stdout and always exits 0; the predeclared verdict is in `all_passed`.
The tolerances and inputs are fixed in README.md before the first run.
"""

import json
import platform

import colour
import numpy as np

EXPECTED_COLOUR_VERSION = "0.4.7"
ROUND_TRIP_TOLERANCE = 1e-6
WHITE_TOLERANCE = 1e-6
DELTA_E_TOLERANCE = 1e-4
BT2020_TOLERANCE = 1e-5

ROUND_TRIP_HEX = [
    "#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff", "#ffff00", "#00ffff", "#ff00ff",
    "#808080", "#1e90ff", "#ff8c00", "#2f4f4f", "#7b3fa0", "#abcdef", "#123456", "#f5deb3",
]

# Sharma, Wu and Dalal (2005) pairs as in examples/colorjs-conversions/run.mjs (secondary transcription).
SHARMA_PAIRS = [
    (1, [50.0, 2.6772, -79.7751], [50.0, 0.0, -82.7485], 2.0425),
    (2, [50.0, 3.1571, -77.2803], [50.0, 0.0, -82.7485], 2.8615),
    (7, [50.0, 0.0, 0.0], [50.0, -1.0, 2.0], 2.3669),
    (9, [50.0, 2.49, -0.001], [50.0, -2.49, 0.0009], 7.1792),
    (17, [50.0, 2.5, 0.0], [73.0, 25.0, -18.0], 27.1492),
    (25, [60.2574, -34.0099, 36.2677], [60.4626, -34.1751, 39.4387], 1.2644),
    (26, [63.0109, -31.0961, -5.8663], [62.8187, -29.7946, -4.0864], 1.263),
    (28, [35.0831, -44.1164, 3.7933], [35.0232, -40.0716, 1.5901], 1.8645),
]

BT709_LINEAR_INPUTS = [
    [1.0, 0.0, 0.0],
    [0.0, 1.0, 0.0],
    [0.0, 0.0, 1.0],
    [0.5, 0.25, 0.75],
    [0.2, 0.4, 0.6],
    [1.0, 1.0, 1.0],
]

# ITU-R BT.2087-0 Table 2: BT.709 linear RGB to BT.2020 linear RGB, six decimals.
BT2087_BT709_TO_BT2020 = np.array(
    [
        [0.627404, 0.329283, 0.043313],
        [0.069097, 0.919540, 0.011362],
        [0.016391, 0.088013, 0.895595],
    ]
)


def rounded(values: np.ndarray | list[float]) -> list[float]:
    return [float(f"{float(value):.12g}") for value in values]


def hex_to_srgb(hex_colour: str) -> np.ndarray:
    value = int(hex_colour[1:], 16)
    return np.array([(value >> 16) & 255, (value >> 8) & 255, value & 255]) / 255.0


def round_trip_row(hex_colour: str) -> dict[str, object]:
    rgb = hex_to_srgb(hex_colour)
    xyz = colour.sRGB_to_XYZ(rgb)
    lab = colour.XYZ_to_Lab(xyz)
    lab_back = colour.XYZ_to_sRGB(colour.Lab_to_XYZ(lab))
    oklab = colour.XYZ_to_Oklab(xyz)
    oklab_back = colour.XYZ_to_sRGB(colour.Oklab_to_XYZ(oklab))
    return {
        "hex": hex_colour,
        "lab": rounded(lab),
        "oklab": rounded(oklab),
        "max_abs_error_lab": float(np.max(np.abs(lab_back - rgb))),
        "max_abs_error_oklab": float(np.max(np.abs(oklab_back - rgb))),
        "all_finite": bool(np.all(np.isfinite(lab)) and np.all(np.isfinite(oklab_back))),
    }


def white_row() -> dict[str, object]:
    lab = colour.XYZ_to_Lab(colour.sRGB_to_XYZ(hex_to_srgb("#ffffff")))
    expected = np.array([100.0, 0.0, 0.0])
    return {"lab": rounded(lab), "max_abs_deviation": float(np.max(np.abs(lab - expected)))}


def delta_e_row(number: int, lab1: list[float], lab2: list[float], published: float) -> dict[str, object]:
    computed = float(colour.delta_E(np.array(lab1), np.array(lab2), method="CIE 2000"))
    return {
        "pair": number,
        "computed": float(f"{computed:.12g}"),
        "published": published,
        "absolute_difference": abs(computed - published),
    }


def bt2020_row(linear_bt709: list[float]) -> dict[str, object]:
    library = colour.RGB_to_RGB(
        np.array(linear_bt709),
        "ITU-R BT.709",
        "ITU-R BT.2020",
        chromatic_adaptation_transform=None,
        apply_cctf_decoding=False,
        apply_cctf_encoding=False,
    )
    published = BT2087_BT709_TO_BT2020 @ np.array(linear_bt709)
    return {
        "input_bt709_linear": rounded(linear_bt709),
        "library_bt2020_linear": rounded(library),
        "published_bt2020_linear": rounded(published),
        "max_abs_deviation": float(np.max(np.abs(library - published))),
    }


def build_result() -> dict[str, object]:
    round_trips = [round_trip_row(hex_colour) for hex_colour in ROUND_TRIP_HEX]
    white = white_row()
    delta_es = [delta_e_row(*pair) for pair in SHARMA_PAIRS]
    bt2020 = [bt2020_row(vector) for vector in BT709_LINEAR_INPUTS]

    checks = {
        "colour_science_version_is_0_4_7": colour.__version__ == EXPECTED_COLOUR_VERSION,
        "round_trip_lab_and_oklab_within_1e-6": all(
            row["all_finite"]
            and row["max_abs_error_lab"] < ROUND_TRIP_TOLERANCE
            and row["max_abs_error_oklab"] < ROUND_TRIP_TOLERANCE
            for row in round_trips
        ),
        "white_lab_within_1e-6": white["max_abs_deviation"] < WHITE_TOLERANCE,
        "delta_e_2000_within_1e-4": all(row["absolute_difference"] < DELTA_E_TOLERANCE for row in delta_es),
        "bt2020_matrix_within_1e-5": all(row["max_abs_deviation"] < BT2020_TOLERANCE for row in bt2020),
    }

    return {
        "colour_science_version": colour.__version__,
        "numpy_version": np.__version__,
        "python_version": platform.python_version(),
        "tolerances": {
            "round_trip": ROUND_TRIP_TOLERANCE,
            "white": WHITE_TOLERANCE,
            "delta_e_2000": DELTA_E_TOLERANCE,
            "bt2020": BT2020_TOLERANCE,
        },
        "round_trip": [
            {key: value for key, value in row.items() if key != "all_finite"} for row in round_trips
        ],
        "white": white,
        "delta_e_2000": delta_es,
        "bt2020": bt2020,
        "checks": checks,
        "all_passed": all(checks.values()),
    }


def main() -> None:
    print(json.dumps(build_result(), indent=2))


if __name__ == "__main__":
    main()
