#!/usr/bin/env python3
import os
import struct
import sys
import zlib

WIDTH = 64
HEIGHT = 64
RECT_X0 = 8
RECT_X1 = 24
RECT_Y0 = 16
RECT_Y1 = 48


def chunk(kind: bytes, payload: bytes) -> bytes:
    return struct.pack(">I", len(payload)) + kind + payload + struct.pack(">I", zlib.crc32(kind + payload) & 0xFFFFFFFF)


def pixel(x: int, y: int) -> tuple[int, int, int, int]:
    if not (RECT_X0 <= x < RECT_X1 and RECT_Y0 <= y < RECT_Y1):
        return (0, 0, 0, 0)
    alpha = round(255 * (x - RECT_X0) / (RECT_X1 - RECT_X0 - 1))
    return (40 + 2 * (y - RECT_Y0), 220 - 3 * (x - RECT_X0), 180, alpha)


def write_rgba_png(path: str) -> None:
    rows = []
    for y in range(HEIGHT):
        row = bytearray([0])
        for x in range(WIDTH):
            row.extend(pixel(x, y))
        rows.append(bytes(row))
    header = struct.pack(">IIBBBBB", WIDTH, HEIGHT, 8, 6, 0, 0, 0)
    png = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", header) + chunk(b"IDAT", zlib.compress(b"".join(rows), 9)) + chunk(b"IEND", b"")
    with open(path, "wb") as handle:
        handle.write(png)


output_path = sys.argv[1]
os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
write_rgba_png(output_path)
