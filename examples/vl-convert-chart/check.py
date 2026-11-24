"""Measure the vl-convert chart against predeclared checks.

Usage: check.py OUTPUT_DIRECTORY NAME
Reads NAME.vl.json, NAME.svg, NAME.png and their NAME-rerun twins, prints JSON
to stdout and exits 1 when any gating check fails. Plain Python only.
"""
import hashlib
import json
import os
import re
import struct
import sys
import xml.etree.ElementTree as ElementTree

PNG_SCALE = 2
PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"
PROPORTION_TOLERANCE_RELATIVE = 0.01
BASELINE_TOLERANCE_PX = 0.5
EXPECTED_BAR_COUNT = 5
BAR_PATH_PATTERN = re.compile(
    r"^M(?P<x>[-0-9.e]+),(?P<y>[-0-9.e]+)h[-0-9.e]+v(?P<height>[-0-9.e]+)h[-0-9.e]+Z$"
)
BAR_LABEL_PATTERN = re.compile(r"^channel: (?P<channel>.+); signups: (?P<signups>.+)$")
SVG_NAMESPACE = "{http://www.w3.org/2000/svg}"


def read_bytes(path: str) -> bytes:
    with open(path, "rb") as handle:
        return handle.read()


def sha256_hex(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def read_bar_paths(svg_root: ElementTree.Element) -> list[ElementTree.Element]:
    return [
        element
        for element in svg_root.iter(f"{SVG_NAMESPACE}path")
        if element.get("aria-roledescription") == "bar"
    ]


def parse_bars(svg_root: ElementTree.Element) -> list[dict[str, object]]:
    bars = []
    for element in read_bar_paths(svg_root):
        path_match = BAR_PATH_PATTERN.match(element.get("d", ""))
        label_match = BAR_LABEL_PATTERN.match(element.get("aria-label", ""))
        if path_match is None or label_match is None:
            raise ValueError(f"unexpected bar markup: {ElementTree.tostring(element)!r}")
        bars.append(
            {
                "channel": label_match.group("channel"),
                "value": float(label_match.group("signups")),
                "top_y": float(path_match.group("y")),
                "height": float(path_match.group("height")),
            }
        )
    return bars


def has_title_text(svg_root: ElementTree.Element, title: str) -> bool:
    return any(
        "".join(element.itertext()).strip() == title
        for element in svg_root.iter(f"{SVG_NAMESPACE}text")
    )


def parse_png_dimensions(png_bytes: bytes) -> tuple[int, int]:
    width, height = struct.unpack_from(">II", png_bytes, 16)
    return width, height


def proportion_deviation(bars: list[dict[str, object]]) -> float:
    ratios = [float(bar["height"]) / float(bar["value"]) for bar in bars]
    mean_ratio = sum(ratios) / len(ratios)
    return max(abs(ratio - mean_ratio) for ratio in ratios) / mean_ratio


def baseline_spread(bars: list[dict[str, object]]) -> float:
    bottoms = [float(bar["top_y"]) + float(bar["height"]) for bar in bars]
    return max(bottoms) - min(bottoms)


def measure(output_directory: str, name: str) -> dict[str, object]:
    rerun_name = f"{name}-rerun"
    with open(os.path.join(output_directory, f"{name}.vl.json"), encoding="utf-8") as spec_file:
        spec = json.load(spec_file)
    svg_bytes = read_bytes(os.path.join(output_directory, f"{name}.svg"))
    svg_rerun_bytes = read_bytes(os.path.join(output_directory, f"{rerun_name}.svg"))
    png_bytes = read_bytes(os.path.join(output_directory, f"{name}.png"))
    png_rerun_bytes = read_bytes(os.path.join(output_directory, f"{rerun_name}.png"))

    svg_root = ElementTree.fromstring(svg_bytes)
    bars = parse_bars(svg_root)
    spec_pairs = sorted(
        (entry["channel"], float(entry["signups"])) for entry in spec["data"]["values"]
    )
    bar_pairs = sorted((str(bar["channel"]), float(bar["value"])) for bar in bars)
    png_width, png_height = parse_png_dimensions(png_bytes)
    spec_width, spec_height = int(spec["width"]), int(spec["height"])
    scale_domain = spec["encoding"]["y"]["scale"]["domain"]
    proportion_error = proportion_deviation(bars)
    bottom_spread = baseline_spread(bars)

    checks = {
        "spec_inline_data_only": "url" not in spec["data"] and "values" in spec["data"],
        "spec_scale_domain_starts_at_zero": scale_domain[0] == 0
        and spec["encoding"]["y"]["scale"]["zero"] is True,
        "svg_size_matches_spec": svg_root.get("width") == str(spec_width)
        and svg_root.get("height") == str(spec_height),
        "svg_bar_mark_count_is_five": len(bars) == EXPECTED_BAR_COUNT,
        "svg_bar_labels_match_data": bar_pairs == spec_pairs,
        "svg_title_text_present": has_title_text(svg_root, spec["title"]),
        "svg_bar_heights_proportional": proportion_error <= PROPORTION_TOLERANCE_RELATIVE,
        "svg_bar_bottoms_aligned": bottom_spread <= BASELINE_TOLERANCE_PX,
        "png_signature": png_bytes[:8] == PNG_SIGNATURE,
        "png_dimensions_match_scale": (png_width, png_height)
        == (spec_width * PNG_SCALE, spec_height * PNG_SCALE),
        "svg_rerun_byte_identical": svg_bytes == svg_rerun_bytes,
        "png_rerun_byte_identical": png_bytes == png_rerun_bytes,
    }
    measurements = {
        "bar_count": len(bars),
        "bar_heights_px": [round(float(bar["height"]), 6) for bar in bars],
        "bar_values": [float(bar["value"]) for bar in bars],
        "baseline_spread_px": round(bottom_spread, 6),
        "png_height_px": png_height,
        "png_width_px": png_width,
        "png_sha256": sha256_hex(png_bytes),
        "proportion_relative_deviation": round(proportion_error, 9),
        "svg_sha256": sha256_hex(svg_bytes),
    }
    return {"checks": checks, "measurements": measurements}


def main(argv: list[str]) -> int:
    if len(argv) != 3:
        print("Usage: check.py OUTPUT_DIRECTORY NAME", file=sys.stderr)
        return 2
    result = measure(argv[1], argv[2])
    print(json.dumps(result, indent=2, sort_keys=True))
    return 0 if all(result["checks"].values()) else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv))
