#!/usr/bin/env python3
"""Checks pyftsubset outputs against the codepoints predeclared in README.md.

Usage: check.py SOURCE_TTF OUTPUT_DIR
Prints a JSON object with gating `checks` (all must be true) and informational `measured`.
Exits 1 when any gating check is false.
"""
import hashlib
import json
import sys
from importlib.metadata import version
from pathlib import Path

from fontTools import version as fonttools_version
from fontTools.ttLib import TTFont

TITLE = "Type & Motion 2026"
ASCII_PRINTABLE_CODEPOINTS = range(0x21, 0x7F)
WOFF2_MAGIC = b"wOF2"


def readCmapCodepoints(fontPath: Path) -> set[int]:
    font = TTFont(str(fontPath))
    codepoints: set[int] = set()
    for subtable in font["cmap"].tables:
        codepoints.update(subtable.cmap.keys())
    return codepoints


def readGlyphCount(fontPath: Path) -> int:
    return len(TTFont(str(fontPath)).getGlyphOrder())


def sha256Of(filePath: Path) -> str:
    return hashlib.sha256(filePath.read_bytes()).hexdigest()


def main() -> int:
    sourcePath = Path(sys.argv[1])
    outputDir = Path(sys.argv[2])
    ttfA = outputDir / "subset-a.ttf"
    ttfB = outputDir / "subset-b.ttf"
    woffA = outputDir / "subset-a.woff2"
    woffB = outputDir / "subset-b.woff2"

    titleCodepoints = set(ord(character) for character in TITLE)
    sourceCodepoints = readCmapCodepoints(sourcePath)
    droppedCodepoints = {
        codepoint
        for codepoint in ASCII_PRINTABLE_CODEPOINTS
        if codepoint in sourceCodepoints and codepoint not in titleCodepoints
    }
    ttfCodepoints = readCmapCodepoints(ttfA)
    woffCodepoints = readCmapCodepoints(woffA)
    woffMagic = woffA.read_bytes()[:4]

    sizes = {
        "source": sourcePath.stat().st_size,
        "ttf": ttfA.stat().st_size,
        "woff2": woffA.stat().st_size,
    }

    checks = {
        "source_has_all_title_codepoints": titleCodepoints <= sourceCodepoints,
        "dropped_set_is_non_empty": len(droppedCodepoints) > 0,
        "ttf_cmap_equals_title_codepoints": ttfCodepoints == titleCodepoints,
        "ttf_cmap_has_no_dropped_codepoint": ttfCodepoints.isdisjoint(droppedCodepoints),
        "woff2_magic_is_wOF2": woffMagic == WOFF2_MAGIC,
        "woff2_cmap_equals_ttf_cmap": woffCodepoints == ttfCodepoints,
        "size_drops_woff2_below_ttf_below_source": sizes["woff2"] < sizes["ttf"] < sizes["source"],
        "ttf_is_byte_identical_across_runs": sha256Of(ttfA) == sha256Of(ttfB),
        "woff2_is_byte_identical_across_runs": sha256Of(woffA) == sha256Of(woffB),
    }

    measured = {
        "fonttools_version": fonttools_version,
        "brotli_version": version("brotli"),
        "title": TITLE,
        "title_codepoints": sorted(f"U+{codepoint:04X}" for codepoint in titleCodepoints),
        "dropped_codepoint_count": len(droppedCodepoints),
        "source_cmap_codepoint_count": len(sourceCodepoints),
        "ttf_cmap_codepoint_count": len(ttfCodepoints),
        "source_glyph_count": readGlyphCount(sourcePath),
        "ttf_glyph_count": readGlyphCount(ttfA),
        "bytes": sizes,
        "sha256": {
            "subset_ttf": sha256Of(ttfA),
            "subset_woff2": sha256Of(woffA),
            "source": sha256Of(sourcePath),
        },
    }

    report = {"checks": checks, "measured": measured}
    print(json.dumps(report, indent=2, sort_keys=True))
    return 0 if all(checks.values()) else 1


if __name__ == "__main__":
    raise SystemExit(main())
