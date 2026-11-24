#!/usr/bin/env python3
"""Decode f3d PNG stills with the standard library and assert the predeclared checks."""
import hashlib
import json
import struct
import sys
import zlib

EXPECTED_VERSION_LINE = "F3D 4.0.1"
WIDTH = 320
HEIGHT = 240
CORNER_BLOCK_PX = 8
MIN_TRANSPARENT_FRACTION = 0.5
OBJECT_REGION = {"x_min": 40, "x_max": 280, "y_min": 30, "y_max": 210}
MIN_OBJECT_EXTENT_PX = 80
MIN_OPAQUE_PIXELS = 4000
PARTIAL_ALPHA_PIXELS_RANGE = (100, 10000)
BYTES_PER_PIXEL = 4


def paeth_predictor(left, up, upper_left):
    estimate = left + up - upper_left
    distance_left = abs(estimate - left)
    distance_up = abs(estimate - up)
    distance_upper_left = abs(estimate - upper_left)
    if distance_left <= distance_up and distance_left <= distance_upper_left:
        return left
    if distance_up <= distance_upper_left:
        return up
    return upper_left


def unfilter_scanlines(raw: bytes, width: int, height: int) -> list[bytearray]:
    stride = width * BYTES_PER_PIXEL
    rows: list[bytearray] = []
    previous = bytearray(stride)
    position = 0
    for _ in range(height):
        filter_type = raw[position]
        line = bytearray(raw[position + 1 : position + 1 + stride])
        position += 1 + stride
        for i in range(stride):
            left = line[i - BYTES_PER_PIXEL] if i >= BYTES_PER_PIXEL else 0
            up = previous[i]
            upper_left = previous[i - BYTES_PER_PIXEL] if i >= BYTES_PER_PIXEL else 0
            if filter_type == 1:
                line[i] = (line[i] + left) & 255
            elif filter_type == 2:
                line[i] = (line[i] + up) & 255
            elif filter_type == 3:
                line[i] = (line[i] + ((left + up) >> 1)) & 255
            elif filter_type == 4:
                line[i] = (line[i] + paeth_predictor(left, up, upper_left)) & 255
            elif filter_type != 0:
                raise ValueError(f"unknown PNG filter type {filter_type}")
        rows.append(line)
        previous = line
    return rows


def read_rgba_png(path: str) -> tuple[int, int, int, int, list[bytearray]]:
    data = open(path, "rb").read()
    assert data[:8] == b"\x89PNG\r\n\x1a\n", f"{path} is not a PNG"
    position = 8
    header = None
    compressed = []
    while position < len(data):
        (length,) = struct.unpack_from(">I", data, position)
        chunk_type = data[position + 4 : position + 8]
        chunk = data[position + 8 : position + 8 + length]
        position += 12 + length
        if chunk_type == b"IHDR":
            header = struct.unpack(">IIBBBBB", chunk)
        elif chunk_type == b"IDAT":
            compressed.append(chunk)
        elif chunk_type == b"IEND":
            break
    assert header is not None, f"{path} has no IHDR"
    width, height, bit_depth, color_type, _, _, interlace = header
    assert interlace == 0, f"{path} is interlaced; this checker reads non-interlaced PNG only"
    rows = unfilter_scanlines(zlib.decompress(b"".join(compressed)), width, height)
    return width, height, bit_depth, color_type, rows


def sha256_of(path: str) -> str:
    return hashlib.sha256(open(path, "rb").read()).hexdigest()


def measure_view(path: str) -> dict:
    width, height, bit_depth, color_type, rows = read_rgba_png(path)
    assert (width, height) == (WIDTH, HEIGHT), f"{path} is {width}x{height}, expected {WIDTH}x{HEIGHT}"
    assert (bit_depth, color_type) == (8, 6), f"{path} is depth {bit_depth} colour type {color_type}, expected RGBA8"

    alpha = [[rows[y][x * BYTES_PER_PIXEL + 3] for x in range(width)] for y in range(height)]
    transparent = sum(1 for row in alpha for a in row if a == 0)
    opaque = sum(1 for row in alpha for a in row if a == 255)
    partial = width * height - transparent - opaque
    corner_alpha_max = 0
    for block_y in (0, height - CORNER_BLOCK_PX):
        for block_x in (0, width - CORNER_BLOCK_PX):
            for y in range(block_y, block_y + CORNER_BLOCK_PX):
                for x in range(block_x, block_x + CORNER_BLOCK_PX):
                    corner_alpha_max = max(corner_alpha_max, alpha[y][x])
    foreground = [(x, y) for y in range(height) for x in range(width) if alpha[y][x] > 0]
    assert foreground, f"{path} has no non-transparent pixels"
    xs = [x for x, _ in foreground]
    ys = [y for _, y in foreground]
    bounds = {"x_min": min(xs), "x_max": max(xs), "y_min": min(ys), "y_max": max(ys)}
    centre = rows[height // 2][(width // 2) * BYTES_PER_PIXEL : (width // 2) * BYTES_PER_PIXEL + 4]
    return {
        "sha256": sha256_of(path),
        "bytes": len(open(path, "rb").read()),
        "dimensions": [width, height],
        "bit_depth": bit_depth,
        "colour_type": color_type,
        "alpha_min": min(min(row) for row in alpha),
        "alpha_max": max(max(row) for row in alpha),
        "transparent_pixels": transparent,
        "partial_alpha_pixels": partial,
        "opaque_pixels": opaque,
        "corner_alpha_max": corner_alpha_max,
        "object_bounds": bounds,
        "centre_rgba": list(centre),
    }


def assert_checks(name: str, view: dict) -> None:
    transparent_fraction = view["transparent_pixels"] / (WIDTH * HEIGHT)
    assert view["corner_alpha_max"] == 0, f"{name}: corner pixel is not transparent"
    assert transparent_fraction >= MIN_TRANSPARENT_FRACTION, f"{name}: transparent fraction {transparent_fraction:.3f}"
    bounds = view["object_bounds"]
    assert OBJECT_REGION["x_min"] <= bounds["x_min"] and bounds["x_max"] <= OBJECT_REGION["x_max"], f"{name}: object x bounds {bounds}"
    assert OBJECT_REGION["y_min"] <= bounds["y_min"] and bounds["y_max"] <= OBJECT_REGION["y_max"], f"{name}: object y bounds {bounds}"
    assert bounds["x_max"] - bounds["x_min"] >= MIN_OBJECT_EXTENT_PX, f"{name}: object too narrow {bounds}"
    assert bounds["y_max"] - bounds["y_min"] >= MIN_OBJECT_EXTENT_PX, f"{name}: object too short {bounds}"
    assert view["opaque_pixels"] >= MIN_OPAQUE_PIXELS, f"{name}: opaque pixels {view['opaque_pixels']}"
    red, green, blue, centre_alpha = view["centre_rgba"]
    assert centre_alpha == 255 and red > green > blue, f"{name}: centre pixel {view['centre_rgba']} is not opaque orange"


def main(version_path: str, view_a_path: str, view_b_path: str, view_a_again_path: str, metrics_path: str) -> None:
    version_line = open(version_path, encoding="utf-8").read().strip()
    assert version_line == EXPECTED_VERSION_LINE, f"f3d reported {version_line!r}, expected {EXPECTED_VERSION_LINE!r}"

    view_a = measure_view(view_a_path)
    view_b = measure_view(view_b_path)
    view_a_again = measure_view(view_a_again_path)
    for name, view in (("view-a", view_a), ("view-b", view_b), ("view-a-after-b", view_a_again)):
        assert_checks(name, view)

    assert view_a["sha256"] != view_b["sha256"], "views A and B are identical; camera options had no effect"
    assert view_a_again["sha256"] == view_a["sha256"], "view A rerun after view B differs from the first view A render"
    low, high = PARTIAL_ALPHA_PIXELS_RANGE
    assert view_a["alpha_min"] == 0 and view_a["alpha_max"] == 255, "middle frame alpha range is not 0..255"
    assert low <= view_a["partial_alpha_pixels"] <= high, f"partial alpha pixels {view_a['partial_alpha_pixels']} outside {low}..{high}"

    metrics = {
        "f3d_version_line": version_line,
        "views": {"view-a": view_a, "view-b": view_b, "view-a-after-b": view_a_again},
        "distinct_hashes": len({view_a["sha256"], view_b["sha256"]}),
    }
    with open(metrics_path, "w", encoding="utf-8") as handle:
        json.dump(metrics, handle, indent=2, sort_keys=True)
        handle.write("\n")


if __name__ == "__main__":
    main(*sys.argv[1:6])
