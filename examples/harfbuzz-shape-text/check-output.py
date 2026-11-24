#!/usr/bin/env python3
"""Semantic checks for hb-shape JSON and hb-view SVG output.

Usage: check-output.py <shape-ids.json> <shape-names.json> <view.svg> <summary.json>
Exits non-zero on the first failed assertion, with the expected and actual values.
"""
import json
import sys
import xml.etree.ElementTree as ElementTree

EXPECTED_TEXT = "a -> b != c"
EXPECTED_GLYPH_COUNT = len(EXPECTED_TEXT)
EXPECTED_ADVANCE_UNITS = 600
LIGATURE_NAME_BY_CLUSTER = {3: "hyphen_greater.liga", 8: "exclam_equal.liga"}


def failWithExpectation(check: str, expected: object, actual: object) -> None:
    sys.exit(f"check failed: {check}\n  expected: {expected!r}\n  actual:   {actual!r}")


def loadGlyphs(path: str) -> list[dict]:
    with open(path, encoding="utf-8") as handle:
        return json.load(handle)


def checkGlyphCountAndClusters(glyphs: list[dict]) -> None:
    if len(glyphs) != EXPECTED_GLYPH_COUNT:
        failWithExpectation("glyph count", EXPECTED_GLYPH_COUNT, len(glyphs))
    clusters = [glyph["cl"] for glyph in glyphs]
    if clusters != list(range(EXPECTED_GLYPH_COUNT)):
        failWithExpectation("clusters in order", list(range(EXPECTED_GLYPH_COUNT)), clusters)


def checkAdvances(glyphs: list[dict]) -> None:
    advances = [glyph["ax"] for glyph in glyphs]
    expected = [EXPECTED_ADVANCE_UNITS] * EXPECTED_GLYPH_COUNT
    if advances != expected:
        failWithExpectation("advances in font units", expected, advances)


def checkLigaturesVisible(namedGlyphs: list[dict]) -> None:
    for cluster, expectedName in LIGATURE_NAME_BY_CLUSTER.items():
        actualName = namedGlyphs[cluster]["g"]
        if actualName != expectedName:
            failWithExpectation(f"ligature glyph at cluster {cluster}", expectedName, actualName)


def checkIdsAgreeWithNames(idGlyphs: list[dict], namedGlyphs: list[dict]) -> None:
    idPairs = [(glyph["cl"], glyph["ax"], glyph["dx"], glyph["dy"]) for glyph in idGlyphs]
    namePairs = [(glyph["cl"], glyph["ax"], glyph["dx"], glyph["dy"]) for glyph in namedGlyphs]
    if idPairs != namePairs:
        failWithExpectation("glyph IDs and names share clusters and positions", namePairs, idPairs)
    for glyph in idGlyphs:
        if not isinstance(glyph["g"], int):
            failWithExpectation("numeric glyph ID", "int", type(glyph["g"]).__name__)


def checkSvgStructure(svgPath: str) -> dict:
    root = ElementTree.parse(svgPath).getroot()
    width = float(root.get("width", "0"))
    height = float(root.get("height", "0"))
    if width <= 0 or height <= 0:
        failWithExpectation("positive SVG width and height", "> 0", [width, height])
    useCount = sum(1 for element in root.iter() if element.tag.endswith("}use"))
    if useCount < 1:
        failWithExpectation("at least one <use> element", ">= 1", useCount)
    return {"width": width, "height": height, "useElements": useCount}


def main() -> None:
    if len(sys.argv) != 5:
        sys.exit("usage: check-output.py <shape-ids.json> <shape-names.json> <view.svg> <summary.json>")
    idsPath, namesPath, svgPath, summaryPath = sys.argv[1:5]
    idGlyphs = loadGlyphs(idsPath)
    namedGlyphs = loadGlyphs(namesPath)

    checkGlyphCountAndClusters(idGlyphs)
    checkGlyphCountAndClusters(namedGlyphs)
    checkAdvances(idGlyphs)
    checkAdvances(namedGlyphs)
    checkLigaturesVisible(namedGlyphs)
    checkIdsAgreeWithNames(idGlyphs, namedGlyphs)
    svgSummary = checkSvgStructure(svgPath)

    summary = {
        "glyphCount": len(namedGlyphs),
        "glyphNamesByCluster": {str(glyph["cl"]): glyph["g"] for glyph in namedGlyphs},
        "svg": svgSummary,
    }
    with open(summaryPath, "w", encoding="utf-8") as handle:
        json.dump(summary, handle, indent=2, sort_keys=True)
        handle.write("\n")
    print("semantic checks passed")


if __name__ == "__main__":
    main()
