#!/usr/bin/env python3
# Usage: check-output.py <output_dir> <metrics_path>
# Reads <output_dir>/version.txt, plain.svg/png and window.svg/png; asserts the predeclared checks.
import base64
import hashlib
import json
import re
import struct
import sys
import xml.etree.ElementTree as ET

EXPECTED_VERSION = "0.2.2"
EXPECTED_BACKGROUND_FILL = "#282a36"  # Dracula theme background, as emitted by freeze
EXPECTED_SVG_WIDTH = 357
EXPECTED_SVG_HEIGHT = 184
EXPECTED_PNG_SCALE = 4  # freeze rasterises PNG at 4x the SVG size
EXPECTED_TOKENS = ["package", "import", "func", "main", "fmt", "Println", "hello", "freeze"]
EXPECTED_LINE_NUMBERS = [str(number) for number in range(1, 8)]
EXPECTED_EMBEDDED_FONT_FAMILY = "JetBrains Mono"
WINDOW_CONTROL_FILLS = ["#FF5A54", "#E6BF29", "#52C12B"]
LINE_NUMBER_FILL = "#7f7f7f"
PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"


def localName(element: ET.Element) -> str:
    return element.tag.split("}")[-1]


def readPngDimensions(pngBytes: bytes) -> tuple[int, int]:
    assert pngBytes.startswith(PNG_SIGNATURE), "output is not a PNG file"
    width, height = struct.unpack(">II", pngBytes[16:24])
    return width, height


def parseSvgRoot(svgBytes: bytes) -> ET.Element:
    root = ET.fromstring(svgBytes)
    assert localName(root) == "svg", f"unexpected SVG root {root.tag!r}"
    return root


def fillsIn(root: ET.Element) -> set[str]:
    return {element.attrib["fill"] for element in root.iter() if "fill" in element.attrib}


def lineNumberTexts(root: ET.Element) -> list[str]:
    return [
        "".join(element.itertext()).strip()
        for element in root.iter()
        if localName(element) == "tspan" and element.attrib.get("fill") == LINE_NUMBER_FILL
    ]


def embeddedFontFacts(root: ET.Element) -> tuple[str, bytes]:
    styleText = "".join(element.text or "" for element in root.iter() if localName(element) == "style")
    family = re.search(r"font-family:\s*&apos;([^&']+)&apos;|font-family:\s*'([^']+)'", styleText)
    assert family, "SVG has no @font-face font-family declaration"
    familyName = family.group(1) or family.group(2)
    assert familyName == EXPECTED_EMBEDDED_FONT_FAMILY, f"embedded font is {familyName!r}, expected {EXPECTED_EMBEDDED_FONT_FAMILY!r}"
    dataUri = re.search(r"base64,([A-Za-z0-9+/=]+)", styleText)
    assert dataUri, "SVG @font-face has no base64 font data"
    return familyName, base64.b64decode(dataUri.group(1))


def checkVariant(outputDirectory: str, variantName: str, expectsWindowChrome: bool) -> dict[str, object]:
    svgBytes = open(f"{outputDirectory}/{variantName}.svg", "rb").read()
    pngBytes = open(f"{outputDirectory}/{variantName}.png", "rb").read()
    root = parseSvgRoot(svgBytes)

    width = float(root.attrib["width"])
    height = float(root.attrib["height"])
    assert (width, height) == (EXPECTED_SVG_WIDTH, EXPECTED_SVG_HEIGHT), f"{variantName} SVG is {width}x{height}, expected {EXPECTED_SVG_WIDTH}x{EXPECTED_SVG_HEIGHT}"

    pngWidth, pngHeight = readPngDimensions(pngBytes)
    expectedPngWidth = EXPECTED_SVG_WIDTH * EXPECTED_PNG_SCALE
    expectedPngHeight = EXPECTED_SVG_HEIGHT * EXPECTED_PNG_SCALE
    assert (pngWidth, pngHeight) == (expectedPngWidth, expectedPngHeight), f"{variantName} PNG is {pngWidth}x{pngHeight}, expected {expectedPngWidth}x{expectedPngHeight}"

    backgroundRect = next(element for element in root.iter() if localName(element) == "rect")
    assert backgroundRect.attrib.get("fill") == EXPECTED_BACKGROUND_FILL, f"{variantName} background rect fill is {backgroundRect.attrib.get('fill')!r}, expected {EXPECTED_BACKGROUND_FILL!r}"

    allText = "".join("".join(element.itertext()) for element in root.iter() if localName(element) == "text")
    missingTokens = [token for token in EXPECTED_TOKENS if token not in allText]
    assert not missingTokens, f"{variantName} SVG text lacks tokens {missingTokens}"

    numbers = lineNumberTexts(root)
    assert numbers == EXPECTED_LINE_NUMBERS, f"{variantName} line numbers are {numbers}, expected {EXPECTED_LINE_NUMBERS}"

    controlFillsPresent = [fill for fill in WINDOW_CONTROL_FILLS if fill in fillsIn(root)]
    if expectsWindowChrome:
        assert controlFillsPresent == WINDOW_CONTROL_FILLS, f"{variantName} window controls missing; found {controlFillsPresent}"
    else:
        assert controlFillsPresent == [], f"{variantName} has window control fills {controlFillsPresent} but chrome should be off"

    return {
        "svg_bytes": len(svgBytes),
        "svg_sha256": hashlib.sha256(svgBytes).hexdigest(),
        "svg_width": int(width),
        "svg_height": int(height),
        "png_bytes": len(pngBytes),
        "png_sha256": hashlib.sha256(pngBytes).hexdigest(),
        "png_width": pngWidth,
        "png_height": pngHeight,
        "tokens_found": EXPECTED_TOKENS,
        "line_numbers": numbers,
        "window_control_fills_found": controlFillsPresent,
    }


outputDirectory, metricsPath = sys.argv[1:]
versionLine = open(f"{outputDirectory}/version.txt", encoding="utf-8").read().strip()
versionMatch = re.search(r"freeze version v([0-9.]+)", versionLine)
assert versionMatch, f"could not parse freeze version from {versionLine!r}"
version = versionMatch.group(1)
assert version == EXPECTED_VERSION, f"freeze is {version}, expected {EXPECTED_VERSION}"

plainFacts = checkVariant(outputDirectory, "plain", expectsWindowChrome=False)
windowFacts = checkVariant(outputDirectory, "window", expectsWindowChrome=True)
assert plainFacts["svg_sha256"] != windowFacts["svg_sha256"], "window-chrome SVG is identical to the plain SVG"

fontFamily, fontBytes = embeddedFontFacts(parseSvgRoot(open(f"{outputDirectory}/plain.svg", "rb").read()))

metrics = {
    "version": version,
    "source_sha256": hashlib.sha256(open("source.go", "rb").read()).hexdigest(),
    "theme": "dracula",
    "background_fill": EXPECTED_BACKGROUND_FILL,
    "padding": 20,
    "plain": plainFacts,
    "window": windowFacts,
    "embedded_font": {
        "family": fontFamily,
        "format": "woff2",
        "bytes": len(fontBytes),
        "sha256": hashlib.sha256(fontBytes).hexdigest(),
    },
}
with open(metricsPath, "w", encoding="utf-8") as handle:
    json.dump(metrics, handle, indent=2, sort_keys=True)
    handle.write("\n")
