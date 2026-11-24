#!/usr/bin/env python3
"""Writes six owned 64x64 RGB PNG frames and an ffmpeg concat list with per-frame durations."""
import os
import struct
import sys
import zlib

FRAME_SIZE = 64
SQUARE_SIZE = 16
# ffmpeg's GIF output lands on a 1/25 s grid and gives the final concat entry the grid default,
# so durations are multiples of 0.04 s and the last frame carries no explicit duration.
FRAME_DURATIONS_SECONDS = (0.12, 0.24, 0.04, 0.16, 0.28, None)


def chunk(kind: bytes, payload: bytes) -> bytes:
    return struct.pack(">I", len(payload)) + kind + payload + struct.pack(">I", zlib.crc32(kind + payload) & 0xFFFFFFFF)


def frame_pixel(x: int, y: int, index: int) -> tuple[int, int, int]:
    squareX0 = 4 + index * 8
    if squareX0 <= x < squareX0 + SQUARE_SIZE and 24 <= y < 24 + SQUARE_SIZE:
        return (40 + 30 * index, 220 - 20 * index, 180)
    return (12 + y, 20 + y * 2 % 200, 40 + x)


def write_png(path: str, index: int) -> None:
    rows = []
    for y in range(FRAME_SIZE):
        row = bytearray([0])
        for x in range(FRAME_SIZE):
            row.extend(frame_pixel(x, y, index))
        rows.append(bytes(row))
    header = struct.pack(">IIBBBBB", FRAME_SIZE, FRAME_SIZE, 8, 2, 0, 0, 0)
    png = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", header) + chunk(b"IDAT", zlib.compress(b"".join(rows), 9)) + chunk(b"IEND", b"")
    with open(path, "wb") as handle:
        handle.write(png)


def write_concat_list(listPath: str, framesDirectory: str) -> None:
    lines = []
    for index, duration in enumerate(FRAME_DURATIONS_SECONDS):
        lines.append(f"file '{os.path.basename(framesDirectory)}/frame{index:03d}.png'")
        if duration is not None:
            lines.append(f"duration {duration:.2f}")
    with open(listPath, "w", encoding="utf-8") as handle:
        handle.write("\n".join(lines) + "\n")


framesDirectory, listPath = sys.argv[1], sys.argv[2]
os.makedirs(framesDirectory, exist_ok=True)
for index in range(len(FRAME_DURATIONS_SECONDS)):
    write_png(os.path.join(framesDirectory, f"frame{index:03d}.png"), index)
write_concat_list(listPath, framesDirectory)
