"""Gating checks for the drawsvg frames. Predeclared values live here, not in generate.py.

Usage: check.py OUTPUT_DIR > checks.json   (exit 1 if any gating check fails)
"""

import hashlib
import json
import re
import struct
import sys
import zlib
from pathlib import Path
import xml.etree.ElementTree as ElementTree

FRAME_TIMES_SECONDS = (0.0, 0.5, 1.0, 1.5, 2.0)
MIDDLE_FRAME_INDEX = 2
EXPECTED_WIDTH_PX = 480
EXPECTED_HEIGHT_PX = 270
FONT_RELATIVE_PATH = "fonts/JetBrainsMono-Bold.ttf"
FONT_SHA256 = "a2349098b9e45419e7bf0e2958d6c4937a049dded37387b08be725be4c7615f3"
SVG_NAMESPACE = "{http://www.w3.org/2000/svg}"
ATTRIBUTE_TOLERANCE = 1e-6
PIXEL_TOLERANCE = 4
CAPTION_BOX_MIN_PIXELS = 100
CAPTION_BOX_X_RANGE = (150, 330)
CAPTION_BOX_Y_RANGE = (236, 256)
CIRCLE_COLOUR_RGB = (228, 87, 46)
SQUARE_COLOUR_RGB = (41, 51, 92)
BAND_COLOUR_AT_X100_RGB = (217, 0, 38)
BAND_COLOUR_AT_X240_RGB = (128, 0, 128)
DIRECTORY_NAMES = ("svg-sequential", "svg-rerun", "svg-shuffled", "png-sequential", "png-shuffled")
PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"


# === PUBLIC API ===

def main(argumentValues: list[str]) -> int:
    if len(argumentValues) != 2:
        print("usage: check.py OUTPUT_DIR", file=sys.stderr)
        return 2
    outputDirectory = Path(argumentValues[1])
    results = collect_check_results(outputDirectory)
    print(json.dumps(results, indent=2, sort_keys=True))
    return 0 if results["allGatingChecksPass"] else 1


def collect_check_results(outputDirectory: Path) -> dict[str, object]:
    checks: dict[str, bool] = {}
    measurements: dict[str, object] = {}
    frameNames = [f"frame-{index:04d}.svg" for index in range(len(FRAME_TIMES_SECONDS))]
    pngNames = [name.replace(".svg", ".png") for name in frameNames]

    checks["frameCountIsFive"] = all(
        len(list((outputDirectory / directory).glob("frame-*"))) == len(FRAME_TIMES_SECONDS)
        for directory in DIRECTORY_NAMES
    )

    svgSequentialBytes = {name: (outputDirectory / "svg-sequential" / name).read_bytes() for name in frameNames}
    pngSequentialBytes = {name: (outputDirectory / "png-sequential" / name).read_bytes() for name in pngNames}
    measurements["svgSha256"] = {name: sha256_hex(data) for name, data in svgSequentialBytes.items()}
    measurements["pngSha256"] = {name: sha256_hex(data) for name, data in pngSequentialBytes.items()}

    checks["svgStructureMatchesPredeclaredElements"] = all(
        check_svg_structure(svgSequentialBytes[name], FRAME_TIMES_SECONDS[index])
        for index, name in enumerate(frameNames)
    )

    decodedFrames = [decode_rgba_png(pngSequentialBytes[name]) for name in pngNames]
    checks["pngDimensionsAre480x270Rgba8"] = all(
        width == EXPECTED_WIDTH_PX and height == EXPECTED_HEIGHT_PX for width, height, _ in decodedFrames
    )

    pixelProbeResults = [
        probe_frame_pixels(decodedFrames[index][2], FRAME_TIMES_SECONDS[index])
        for index in range(len(FRAME_TIMES_SECONDS))
    ]
    measurements["captionOpaquePixelCounts"] = [result["captionOpaquePixels"] for result in pixelProbeResults]
    checks["pixelProbesMatchPredeclaredValues"] = all(result["allProbesPass"] for result in pixelProbeResults)
    checks["captionUsesBundledFont"] = all(
        result["captionOpaquePixels"] >= CAPTION_BOX_MIN_PIXELS for result in pixelProbeResults
    )

    pngHashes = [measurements["pngSha256"][name] for name in pngNames]
    svgHashes = [measurements["svgSha256"][name] for name in frameNames]
    checks["framesAreDistinctPng"] = len(set(pngHashes)) == len(pngHashes)
    checks["framesAreDistinctSvg"] = len(set(svgHashes)) == len(svgHashes)
    measurements["distinctPngHashCount"] = len(set(pngHashes))

    checks["regenerationIsByteIdentical"] = all(
        (outputDirectory / "svg-rerun" / name).read_bytes() == svgSequentialBytes[name] for name in frameNames
    )
    checks["shuffledOrderSvgEqualsSequential"] = all(
        (outputDirectory / "svg-shuffled" / name).read_bytes() == svgSequentialBytes[name] for name in frameNames
    )
    checks["shuffledOrderPngEqualsSequential"] = all(
        (outputDirectory / "png-shuffled" / name).read_bytes() == pngSequentialBytes[name] for name in pngNames
    )

    middleAlphas = alpha_statistics(decodedFrames[MIDDLE_FRAME_INDEX][2])
    measurements["middleFrameAlpha"] = middleAlphas
    checks["middleFrameAlphaRange"] = (
        middleAlphas["minimum"] == 0 and middleAlphas["maximum"] == 255 and middleAlphas["partialCount"] > 0
    )

    fontSha256 = sha256_hex(Path(__file__).resolve().parent.joinpath(FONT_RELATIVE_PATH).read_bytes())
    measurements["fontSha256"] = fontSha256
    checks["bundledFontHashMatches"] = fontSha256 == FONT_SHA256

    gatingChecks = {name: passed for name, passed in checks.items()}
    return {
        "checks": gatingChecks,
        "measurements": measurements,
        "allGatingChecksPass": all(gatingChecks.values()),
    }


# === HELPERS ===

def check_svg_structure(svgBytes: bytes, frameTimeSeconds: float) -> bool:
    root = ElementTree.fromstring(svgBytes)
    if root.tag != f"{SVG_NAMESPACE}svg":
        return False
    if root.get("width") != str(EXPECTED_WIDTH_PX) or root.get("height") != str(EXPECTED_HEIGHT_PX):
        return False

    elementsById = {element.get("id"): element for element in root.iter() if element.get("id")}
    circle = elementsById.get("moving-circle")
    square = elementsById.get("rotating-square")
    band = elementsById.get("band")
    gradient = elementsById.get("band-gradient")
    caption = elementsById.get("caption")
    if any(element is None for element in (circle, square, band, gradient, caption)):
        return False

    expectedCircleX = 60.0 + 180.0 * frameTimeSeconds
    if circle.tag != f"{SVG_NAMESPACE}circle":
        return False
    if abs(float(circle.get("cx")) - expectedCircleX) > ATTRIBUTE_TOLERANCE:
        return False
    if abs(float(circle.get("cy")) - 80.0) > ATTRIBUTE_TOLERANCE or abs(float(circle.get("r")) - 30.0) > ATTRIBUTE_TOLERANCE:
        return False
    if circle.get("fill") != "#e4572e":
        return False

    rotationMatch = re.fullmatch(r"rotate\(([-0-9.eE+]+) 240\.0 150\.0\)", square.get("transform", ""))
    if rotationMatch is None or square.tag != f"{SVG_NAMESPACE}rect":
        return False
    if abs(float(rotationMatch.group(1)) - 45.0 * frameTimeSeconds) > ATTRIBUTE_TOLERANCE:
        return False
    if square.get("fill") != "#29335c":
        return False

    if band.get("fill") != "url(#band-gradient)":
        return False

    stops = [child for child in gradient if child.tag == f"{SVG_NAMESPACE}stop"]
    stopSummary = [(stop.get("offset"), stop.get("stop-color")) for stop in stops]
    if stopSummary != [("0", "#ff0000"), ("1", "#0000ff")]:
        return False

    if caption.text != f"t={frameTimeSeconds:.1f}s":
        return False
    return "JetBrains Mono" in (caption.get("font-family") or "")


def probe_frame_pixels(rows: list[bytearray], frameTimeSeconds: float) -> dict[str, object]:
    expectedCircleX = int(round(60.0 + 180.0 * frameTimeSeconds))
    probes = [
        ((expectedCircleX, 80), CIRCLE_COLOUR_RGB, 255),
        ((240, 150), SQUARE_COLOUR_RGB, 255),
        ((100, 210), BAND_COLOUR_AT_X100_RGB, 255),
        ((240, 210), BAND_COLOUR_AT_X240_RGB, 255),
    ]
    probeOutcomes = []
    for (x, y), expectedRgb, expectedAlpha in probes:
        red, green, blue, alpha = pixel_at(rows, x, y)
        matchesColour = all(
            abs(actual - expected) <= PIXEL_TOLERANCE
            for actual, expected in zip((red, green, blue), expectedRgb)
        )
        probeOutcomes.append(matchesColour and alpha == expectedAlpha)
    transparentRed, transparentGreen, transparentBlue, transparentAlpha = pixel_at(rows, 4, 4)
    probeOutcomes.append(transparentAlpha == 0)

    captionOpaquePixels = 0
    for y in range(CAPTION_BOX_Y_RANGE[0], CAPTION_BOX_Y_RANGE[1]):
        for x in range(CAPTION_BOX_X_RANGE[0], CAPTION_BOX_X_RANGE[1]):
            if pixel_at(rows, x, y)[3] > 0:
                captionOpaquePixels += 1
    return {"allProbesPass": all(probeOutcomes), "captionOpaquePixels": captionOpaquePixels}


def pixel_at(rows: list[bytearray], x: int, y: int) -> tuple[int, int, int, int]:
    offset = x * 4
    row = rows[y]
    return (row[offset], row[offset + 1], row[offset + 2], row[offset + 3])


def alpha_statistics(rows: list[bytearray]) -> dict[str, int]:
    alphas = [row[index] for row in rows for index in range(3, len(row), 4)]
    return {
        "minimum": min(alphas),
        "maximum": max(alphas),
        "partialCount": sum(1 for alpha in alphas if 0 < alpha < 255),
    }


def decode_rgba_png(pngBytes: bytes) -> tuple[int, int, list[bytearray]]:
    if not pngBytes.startswith(PNG_SIGNATURE):
        raise ValueError("not a PNG file; check that resvg wrote the frame")
    offset = len(PNG_SIGNATURE)
    width = height = 0
    bitDepth = colourType = interlaceMethod = -1
    compressedChunks: list[bytes] = []
    while offset < len(pngBytes):
        chunkLength = struct.unpack(">I", pngBytes[offset:offset + 4])[0]
        chunkType = pngBytes[offset + 4:offset + 8]
        chunkData = pngBytes[offset + 8:offset + 8 + chunkLength]
        offset += 12 + chunkLength
        if chunkType == b"IHDR":
            width, height, bitDepth, colourType, _, _, interlaceMethod = struct.unpack(">IIBBBBB", chunkData)
        elif chunkType == b"IDAT":
            compressedChunks.append(chunkData)
        elif chunkType == b"IEND":
            break
    if (bitDepth, colourType, interlaceMethod) != (8, 6, 0):
        raise ValueError(
            f"expected 8-bit non-interlaced RGBA, got depth {bitDepth} colour type {colourType} "
            f"interlace {interlaceMethod}"
        )
    raw = zlib.decompress(b"".join(compressedChunks))
    stride = width * 4
    rows: list[bytearray] = []
    previousRow = bytearray(stride)
    position = 0
    for _ in range(height):
        filterType = raw[position]
        line = bytearray(raw[position + 1:position + 1 + stride])
        position += 1 + stride
        for index in range(stride):
            left = line[index - 4] if index >= 4 else 0
            up = previousRow[index]
            upLeft = previousRow[index - 4] if index >= 4 else 0
            if filterType == 0:
                predictor = 0
            elif filterType == 1:
                predictor = left
            elif filterType == 2:
                predictor = up
            elif filterType == 3:
                predictor = (left + up) >> 1
            elif filterType == 4:
                predictor = paeth(left, up, upLeft)
            else:
                raise ValueError(f"unknown PNG filter type {filterType}")
            line[index] = (line[index] + predictor) & 255
        rows.append(line)
        previousRow = line
    return width, height, rows


def paeth(left: int, up: int, upLeft: int) -> int:
    estimate = left + up - upLeft
    distanceLeft = abs(estimate - left)
    distanceUp = abs(estimate - up)
    distanceUpLeft = abs(estimate - upLeft)
    if distanceLeft <= distanceUp and distanceLeft <= distanceUpLeft:
        return left
    if distanceUp <= distanceUpLeft:
        return up
    return upLeft


def sha256_hex(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


if __name__ == "__main__":
    sys.exit(main(sys.argv))
