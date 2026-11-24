#!/usr/bin/env python3
# Predeclared checks for the typst title card. Writes metrics.json, then exits 1 if any check is false.
import filecmp
import hashlib
import json
import struct
import sys
import xml.etree.ElementTree as ET
import zlib
from pathlib import Path

TYPST_VERSION = "0.15.1"
FONT_FAMILY = "JetBrains Mono"
PAGE_WIDTH_PT = 640
PAGE_HEIGHT_PT = 360
PPI = 144
EXPECTED_PNG_WIDTH = PAGE_WIDTH_PT * PPI // 72
EXPECTED_PNG_HEIGHT = PAGE_HEIGHT_PT * PPI // 72
EXPECTED_HEADING = "Kestrel Survey Summary"
EXPECTED_VALUE = "KS-7342"
PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"


def localName(element: ET.Element) -> str:
    return element.tag.split("}")[-1]


def sha256File(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def readPng(path: Path) -> tuple[int, int, int, int, bytes]:
    data = path.read_bytes()
    assert data[:8] == PNG_SIGNATURE, "not a PNG file"
    position = 8
    width = height = bitDepth = colorType = 0
    idat = bytearray()
    while position < len(data):
        length, = struct.unpack(">I", data[position:position + 4])
        chunkType = data[position + 4:position + 8]
        chunk = data[position + 8:position + 8 + length]
        if chunkType == b"IHDR":
            width, height, bitDepth, colorType = struct.unpack(">IIBB", chunk[:10])
        elif chunkType == b"IDAT":
            idat += chunk
        position += 12 + length
    return width, height, bitDepth, colorType, zlib.decompress(bytes(idat))


def unfilterRgbaRows(raw: bytes, width: int, height: int) -> list[bytearray]:
    bytesPerPixel = 4
    rowBytes = width * bytesPerPixel
    rows: list[bytearray] = []
    previous = bytearray(rowBytes)
    position = 0
    for _ in range(height):
        filterType = raw[position]
        line = bytearray(raw[position + 1:position + 1 + rowBytes])
        position += 1 + rowBytes
        for i in range(rowBytes):
            left = line[i - bytesPerPixel] if i >= bytesPerPixel else 0
            up = previous[i]
            upLeft = previous[i - bytesPerPixel] if i >= bytesPerPixel else 0
            if filterType == 1:
                line[i] = (line[i] + left) & 255
            elif filterType == 2:
                line[i] = (line[i] + up) & 255
            elif filterType == 3:
                line[i] = (line[i] + ((left + up) >> 1)) & 255
            elif filterType == 4:
                estimate = left + up - upLeft
                distanceLeft = abs(estimate - left)
                distanceUp = abs(estimate - up)
                distanceUpLeft = abs(estimate - upLeft)
                if distanceLeft <= distanceUp and distanceLeft <= distanceUpLeft:
                    predictor = left
                elif distanceUp <= distanceUpLeft:
                    predictor = up
                else:
                    predictor = upLeft
                line[i] = (line[i] + predictor) & 255
            elif filterType != 0:
                raise ValueError(f"unknown PNG filter type {filterType}")
        rows.append(line)
        previous = line
    return rows


def pngAlphaRange(path: Path, width: int, height: int) -> tuple[int, int]:
    _, _, _, _, raw = readPng(path)
    rows = unfilterRgbaRows(raw, width, height)
    alphas = [value for row in rows for value in row[3::4]]
    return min(alphas), max(alphas)


def svgViewBoxSize(root: ET.Element) -> tuple[float, float]:
    values = [float(value) for value in root.attrib["viewBox"].split()]
    return values[2], values[3]


def svgTextContent(root: ET.Element) -> str:
    return " ".join("".join(element.itertext()) for element in root.iter() if localName(element) == "text")


def queryHeadingMatches(path: Path) -> bool:
    elements = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(elements, list) or len(elements) != 1:
        return False
    element = elements[0]
    return element.get("func") == "heading" and EXPECTED_HEADING in json.dumps(element.get("body", {}))


outputDirectory = Path(sys.argv[1])
metricsPath = Path(sys.argv[2])
svgPath = outputDirectory / "title.svg"
pngPath = outputDirectory / "title.png"
variantSvgPath = outputDirectory / "variant" / "title.svg"

versionLine = (outputDirectory / "version.txt").read_text(encoding="utf-8").strip()
fontsListing = (outputDirectory / "fonts.txt").read_text(encoding="utf-8")

svgRoot = ET.fromstring(svgPath.read_bytes())
svgText = svgPath.read_text(encoding="utf-8")
viewBoxWidth, viewBoxHeight = svgViewBoxSize(svgRoot)
pngWidth, pngHeight, pngBitDepth, pngColorType, _ = readPng(pngPath)
alphaMinimum, alphaMaximum = pngAlphaRange(pngPath, pngWidth, pngHeight)

checks = {
    "typst_version_is_0_15_1": versionLine == f"typst {TYPST_VERSION}" or versionLine.startswith(f"typst {TYPST_VERSION} "),
    "font_family_listed_with_flags": FONT_FAMILY in fontsListing,
    "svg_root_is_svg": localName(svgRoot) == "svg",
    "svg_viewbox_is_page_in_points": (viewBoxWidth, viewBoxHeight) == (PAGE_WIDTH_PT, PAGE_HEIGHT_PT),
    "png_dimensions_match_page_times_ppi": (pngWidth, pngHeight) == (EXPECTED_PNG_WIDTH, EXPECTED_PNG_HEIGHT),
    "png_is_rgba_8bit": (pngBitDepth, pngColorType) == (8, 6),
    "png_alpha_has_transparent_and_opaque": (alphaMinimum, alphaMaximum) == (0, 255),
    "svg_contains_value_as_text": EXPECTED_VALUE in svgText or EXPECTED_VALUE in svgTextContent(svgRoot),
    "query_returns_one_heading": queryHeadingMatches(outputDirectory / "query-heading.json"),
    "svg_rerun_byte_identical": filecmp.cmp(svgPath, outputDirectory / "title-repeat.svg", shallow=False),
    "png_rerun_byte_identical": filecmp.cmp(pngPath, outputDirectory / "title-repeat.png", shallow=False),
    "json_variant_changes_svg": sha256File(variantSvgPath) != sha256File(svgPath),
}

metrics = {
    "typst": versionLine,
    "svg_sha256": sha256File(svgPath),
    "svg_bytes": svgPath.stat().st_size,
    "svg_viewBox": svgRoot.attrib.get("viewBox"),
    "png_sha256": sha256File(pngPath),
    "png_bytes": pngPath.stat().st_size,
    "png_width": pngWidth,
    "png_height": pngHeight,
    "png_bit_depth": pngBitDepth,
    "png_color_type": pngColorType,
    "png_alpha_min": alphaMinimum,
    "png_alpha_max": alphaMaximum,
    "query_heading_sha256": sha256File(outputDirectory / "query-heading.json"),
    "variant_svg_sha256": sha256File(variantSvgPath),
    "checks": checks,
}
metricsPath.write_text(json.dumps(metrics, indent=2, sort_keys=True) + "\n", encoding="utf-8")

for name, passed in checks.items():
    print(f"{'PASS' if passed else 'FAIL'} {name}")

sys.exit(0 if all(checks.values()) else 1)
