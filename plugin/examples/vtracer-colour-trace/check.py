"""Gating checks for the vtracer colour trace. Predeclared values live here, not in trace.py.

Usage: check.py OUTPUT_DIR > checks.json   (exit 1 if any gating check fails)

Pixels are read through ImageMagick as raw RGBA, so this script needs only the
standard library. Each pixel is assigned to its nearest palette colour (RGB,
squared distance) after compositing over white.
"""

import hashlib
import json
import subprocess
import sys
import xml.etree.ElementTree as ElementTree
from importlib import metadata
from pathlib import Path

EXPECTED_VTRACER_VERSION = "0.6.15"
CANVAS_SIDE_PX = 240
PALETTE_RGB = {
    "background": (255, 255, 255),
    "red": (220, 30, 30),
    "blue": (30, 60, 200),
    "green": (30, 160, 60),
}
SHAPE_NAMES = ("red", "blue", "green")
MINIMUM_SOURCE_PIXELS_PER_CLASS = 1000
FILL_CHANNEL_TOLERANCE = 16
IOU_MINIMUM = 0.95
MAE_MAXIMUM = 12.0
BBOX_MARGIN_PX = 3
SVG_NAMESPACE = "{http://www.w3.org/2000/svg}"
RgbTuple = tuple[int, int, int]


# === PUBLIC API ===

def main(argumentValues: list[str]) -> int:
    if len(argumentValues) != 2:
        print("usage: check.py OUTPUT_DIR", file=sys.stderr)
        return 2
    report = buildReport(Path(argumentValues[1]))
    print(json.dumps(report, indent=2, sort_keys=True))
    return 0 if report["passed"] else 1


def buildReport(outputDirectory: Path) -> dict:
    sourceRgba = readRgba(outputDirectory / "source.png")
    renderedRgba = readRgba(outputDirectory / "rendered.png")
    sourceRgb = toRgbOverWhite(sourceRgba["bytes"])
    renderedRgb = toRgbOverWhite(renderedRgba["bytes"])
    sourceClasses = classifyPixels(sourceRgb)
    renderedClasses = classifyPixels(renderedRgb)
    svgPath = outputDirectory / "trace.svg"
    fills = readFillColours(svgPath)
    svgRoot = ElementTree.parse(svgPath).getroot()

    sourcePixelCounts = {name: sourceClasses.count(name) for name in PALETTE_RGB}
    shapes = {}
    for name in SHAPE_NAMES:
        box = classBoundingBox(sourceClasses, name, renderedRgba["width"])
        shapes[name] = {
            "bounding_box": list(box),
            "fill_path_count": countFillsWithinTolerance(fills, PALETTE_RGB[name]),
            "fill_nearest_channel_difference": nearestChannelDifference(fills, PALETTE_RGB[name]),
            "iou": round(intersectionOverUnion(sourceClasses, renderedClasses, name), 6),
            "mae": round(meanAbsoluteErrorInBox(sourceRgb, renderedRgb, box, renderedRgba["width"]), 4),
        }
    backgroundIou = round(intersectionOverUnion(sourceClasses, renderedClasses, "background"), 6)

    svgRerunIdentical = (outputDirectory / "trace.svg").read_bytes() == (outputDirectory / "trace-rerun.svg").read_bytes()
    renderedRerunIdentical = (outputDirectory / "rendered.png").read_bytes() == (outputDirectory / "rendered-rerun.png").read_bytes()

    gates = {
        "vtracer_version_is_pinned": vtracerVersion() == EXPECTED_VTRACER_VERSION,
        "source_palette_pixels": all(count >= MINIMUM_SOURCE_PIXELS_PER_CLASS for count in sourcePixelCounts.values()),
        "canvas_is_240_px": sourceRgba["width"] == CANVAS_SIDE_PX
        and sourceRgba["height"] == CANVAS_SIDE_PX
        and renderedRgba["width"] == CANVAS_SIDE_PX
        and renderedRgba["height"] == CANVAS_SIDE_PX
        and svgRoot.attrib.get("width") == str(CANVAS_SIDE_PX)
        and svgRoot.attrib.get("height") == str(CANVAS_SIDE_PX),
        "svg_fills_match_palette": all(shapes[name]["fill_path_count"] >= 1 for name in SHAPE_NAMES),
        "shape_iou_at_least_minimum": backgroundIou >= IOU_MINIMUM
        and all(shapes[name]["iou"] >= IOU_MINIMUM for name in SHAPE_NAMES),
        "shape_mae_at_most_maximum": all(shapes[name]["mae"] <= MAE_MAXIMUM for name in SHAPE_NAMES),
        "svg_rerun_byte_identical": svgRerunIdentical,
        "rendered_rerun_byte_identical": renderedRerunIdentical,
    }
    return {
        "background_iou": backgroundIou,
        "gates": gates,
        "minimum_rendered_alpha": min(renderedRgba["bytes"][3::4]),
        "passed": all(gates.values()),
        "rendered_sha256": sha256Of(outputDirectory / "rendered.png"),
        "shapes": shapes,
        "source_pixels": sourcePixelCounts,
        "svg_sha256": sha256Of(svgPath),
        "vtracer_version": vtracerVersion(),
    }


# === HELPERS ===

def vtracerVersion() -> str:
    return metadata.version("vtracer")


def readRgba(imagePath: Path) -> dict:
    dimensions = subprocess.run(
        ["magick", "identify", "-format", "%w %h", str(imagePath)],
        check=True, capture_output=True, text=True,
    ).stdout.split()
    raw = subprocess.run(
        ["magick", str(imagePath), "-depth", "8", "RGBA:-"],
        check=True, capture_output=True,
    ).stdout
    return {"width": int(dimensions[0]), "height": int(dimensions[1]), "bytes": raw}


def toRgbOverWhite(rgbaBytes: bytes) -> list[RgbTuple]:
    pixels: list[RgbTuple] = []
    for offset in range(0, len(rgbaBytes), 4):
        red, green, blue, alpha = rgbaBytes[offset:offset + 4]
        pixels.append((
            compositeChannelOverWhite(red, alpha),
            compositeChannelOverWhite(green, alpha),
            compositeChannelOverWhite(blue, alpha),
        ))
    return pixels


def compositeChannelOverWhite(channel: int, alpha: int) -> int:
    return (channel * alpha + 255 * (255 - alpha)) // 255


def nearestPaletteName(pixel: RgbTuple) -> str:
    return min(
        PALETTE_RGB,
        key=lambda name: sum((pixel[i] - PALETTE_RGB[name][i]) ** 2 for i in range(3)),
    )


def classifyPixels(rgbPixels: list[RgbTuple]) -> list[str]:
    return [nearestPaletteName(pixel) for pixel in rgbPixels]


def intersectionOverUnion(sourceClasses: list[str], renderedClasses: list[str], className: str) -> float:
    intersection = 0
    union = 0
    for sourceName, renderedName in zip(sourceClasses, renderedClasses):
        inSource = sourceName == className
        inRendered = renderedName == className
        intersection += inSource and inRendered
        union += inSource or inRendered
    return intersection / union if union else 0.0


def classBoundingBox(sourceClasses: list[str], className: str, sideLengthPx: int) -> tuple[int, int, int, int]:
    indices = [index for index, name in enumerate(sourceClasses) if name == className]
    xs = [index % sideLengthPx for index in indices]
    ys = [index // sideLengthPx for index in indices]
    return (
        max(0, min(xs) - BBOX_MARGIN_PX),
        max(0, min(ys) - BBOX_MARGIN_PX),
        min(sideLengthPx - 1, max(xs) + BBOX_MARGIN_PX),
        min(sideLengthPx - 1, max(ys) + BBOX_MARGIN_PX),
    )


def meanAbsoluteErrorInBox(
    sourceRgb: list[RgbTuple],
    renderedRgb: list[RgbTuple],
    box: tuple[int, int, int, int],
    sideLengthPx: int,
) -> float:
    left, top, right, bottom = box
    total = 0
    count = 0
    for y in range(top, bottom + 1):
        for x in range(left, right + 1):
            index = y * sideLengthPx + x
            total += sum(abs(sourceRgb[index][i] - renderedRgb[index][i]) for i in range(3))
            count += 3
    return total / count


def readFillColours(svgPath: Path) -> list[RgbTuple]:
    root = ElementTree.parse(svgPath).getroot()
    colours: list[RgbTuple] = []
    for pathElement in root.iter(SVG_NAMESPACE + "path"):
        fillValue = pathElement.attrib.get("fill", "")
        if len(fillValue) == 7 and fillValue.startswith("#"):
            colours.append((int(fillValue[1:3], 16), int(fillValue[3:5], 16), int(fillValue[5:7], 16)))
    return colours


def channelDifference(fillColour: RgbTuple, paletteColour: RgbTuple) -> int:
    return max(abs(fillColour[i] - paletteColour[i]) for i in range(3))


def countFillsWithinTolerance(fills: list[RgbTuple], paletteColour: RgbTuple) -> int:
    return sum(channelDifference(fill, paletteColour) <= FILL_CHANNEL_TOLERANCE for fill in fills)


def nearestChannelDifference(fills: list[RgbTuple], paletteColour: RgbTuple) -> int:
    return min((channelDifference(fill, paletteColour) for fill in fills), default=255)


def sha256Of(filePath: Path) -> str:
    return hashlib.sha256(filePath.read_bytes()).hexdigest()


if __name__ == "__main__":
    sys.exit(main(sys.argv))
