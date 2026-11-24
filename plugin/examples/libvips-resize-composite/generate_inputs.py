#!/usr/bin/env python3
"""Write the two owned RGBA PNG inputs for the libvips fixture, using only the standard library."""
import struct
import sys
import zlib
from pathlib import Path

LARGE_SIZE = 4096
OVERLAY_SIZE = 256
OVERLAY_FRAME_PX = 16

# Quadrant colours (R, G, B, A) of the 4096x4096 base image.
TOP_LEFT = (200, 30, 30, 255)
TOP_RIGHT = (30, 180, 60, 128)
BOTTOM_LEFT = (30, 60, 200, 255)
BOTTOM_RIGHT = (240, 220, 40, 255)
OVERLAY_COLOUR = (255, 255, 0, 128)
OVERLAY_FRAME_COLOUR = (0, 0, 0, 0)


def encodePngChunk(chunkType: bytes, chunkData: bytes) -> bytes:
    checksum = zlib.crc32(chunkType + chunkData) & 0xFFFFFFFF
    return struct.pack(">I", len(chunkData)) + chunkType + chunkData + struct.pack(">I", checksum)


def encodeRgbaPng(width: int, height: int, scanlineFor: "callable[[int], bytes]") -> bytes:
    header = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    rawScanlines = b"".join(b"\x00" + scanlineFor(row) for row in range(height))
    return (
        b"\x89PNG\r\n\x1a\n"
        + encodePngChunk(b"IHDR", header)
        + encodePngChunk(b"IDAT", zlib.compress(rawScanlines, 9))
        + encodePngChunk(b"IEND", b"")
    )


def pixelsOf(colour: tuple[int, int, int, int], count: int) -> bytes:
    return bytes(colour) * count


def writeLargeBase(outputPath: Path) -> None:
    half = LARGE_SIZE // 2
    topRow = pixelsOf(TOP_LEFT, half) + pixelsOf(TOP_RIGHT, half)
    bottomRow = pixelsOf(BOTTOM_LEFT, half) + pixelsOf(BOTTOM_RIGHT, half)
    outputPath.write_bytes(
        encodeRgbaPng(LARGE_SIZE, LARGE_SIZE, lambda row: topRow if row < half else bottomRow)
    )


def overlayPixelRowBytes(row: int) -> bytes:
    lastIndex = OVERLAY_SIZE - OVERLAY_FRAME_PX
    isFrameRow = row < OVERLAY_FRAME_PX or row >= lastIndex
    if isFrameRow:
        return pixelsOf(OVERLAY_FRAME_COLOUR, OVERLAY_SIZE)
    return (
        pixelsOf(OVERLAY_FRAME_COLOUR, OVERLAY_FRAME_PX)
        + pixelsOf(OVERLAY_COLOUR, OVERLAY_SIZE - 2 * OVERLAY_FRAME_PX)
        + pixelsOf(OVERLAY_FRAME_COLOUR, OVERLAY_FRAME_PX)
    )


def writeOverlay(outputPath: Path) -> None:
    outputPath.write_bytes(encodeRgbaPng(OVERLAY_SIZE, OVERLAY_SIZE, overlayPixelRowBytes))


# === PUBLIC API ===

def main(argv: list[str]) -> int:
    if len(argv) != 2:
        print("usage: generate_inputs.py <output-directory>", file=sys.stderr)
        return 2
    outputDirectory = Path(argv[1])
    outputDirectory.mkdir(parents=True, exist_ok=True)
    writeLargeBase(outputDirectory / "large.png")
    writeOverlay(outputDirectory / "overlay.png")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
