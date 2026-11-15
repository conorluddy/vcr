#!/usr/bin/env python3
import os
import struct
import sys
import zlib


def chunk(kind: bytes, payload: bytes) -> bytes:
    return struct.pack(">I", len(payload)) + kind + payload + struct.pack(">I", zlib.crc32(kind + payload) & 0xFFFFFFFF)


def write_png(path: str, x0: int) -> None:
    width = height = 64
    rows = []
    for y in range(height):
        row = bytearray([0])
        for x in range(width):
            if x0 <= x < x0 + 16 and 16 <= y < 48:
                row.extend((40, 220, 180))
            else:
                row.extend((18, 28, 48))
        rows.append(bytes(row))
    header = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)
    png = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", header) + chunk(b"IDAT", zlib.compress(b"".join(rows), 9)) + chunk(b"IEND", b"")
    with open(path, "wb") as handle:
        handle.write(png)


directory = sys.argv[1]
os.makedirs(directory, exist_ok=True)
for index, x0 in enumerate((4, 24, 44)):
    write_png(os.path.join(directory, f"frame{index:03d}.png"), x0)
