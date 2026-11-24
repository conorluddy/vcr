#!/usr/bin/env python3
"""Writes the deterministic base PNG: 256x256 opaque RGB with gradients, a fine grid, hard circles and a texture."""
import os
import struct
import sys
import zlib

SIZE = 256
CIRCLES = ((64, 72, 40), (176, 96, 28), (120, 190, 52))


def chunk(kind: bytes, payload: bytes) -> bytes:
    return struct.pack(">I", len(payload)) + kind + payload + struct.pack(">I", zlib.crc32(kind + payload) & 0xFFFFFFFF)


def pixel(x: int, y: int) -> tuple:
    red = (x * 255) // (SIZE - 1)
    green = (y * 255) // (SIZE - 1)
    blue = 128
    if x % 4 == 0 or y % 4 == 0:
        red, green, blue = 20, 20, 24
    for centre_x, centre_y, radius in CIRCLES:
        if (x - centre_x) ** 2 + (y - centre_y) ** 2 <= radius * radius:
            red, green, blue = 250, 210, (x * 7 + y * 3) % 256
    texture = (x * x + 3 * y * y) % 37
    return ((red + texture) % 256, (green + texture // 2) % 256, blue)


def base_png() -> bytes:
    rows = []
    for y in range(SIZE):
        row = bytearray([0])
        for x in range(SIZE):
            row.extend(pixel(x, y))
        rows.append(bytes(row))
    header = struct.pack(">IIBBBBB", SIZE, SIZE, 8, 2, 0, 0, 0)
    return (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", header)
        + chunk(b"IDAT", zlib.compress(b"".join(rows), 9))
        + chunk(b"IEND", b"")
    )


directory = sys.argv[1]
os.makedirs(directory, exist_ok=True)
with open(os.path.join(directory, "base.png"), "wb") as handle:
    handle.write(base_png())
