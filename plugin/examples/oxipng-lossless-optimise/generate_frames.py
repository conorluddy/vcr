#!/usr/bin/env python3
"""Writes deterministic PNG inputs: three RGBA and three palette frames, each carrying metadata chunks."""
import os
import struct
import sys
import zlib

SIZE = 64


def chunk(kind: bytes, payload: bytes) -> bytes:
    return struct.pack(">I", len(payload)) + kind + payload + struct.pack(">I", zlib.crc32(kind + payload) & 0xFFFFFFFF)


def metadata_chunks() -> bytes:
    return (
        chunk(b"pHYs", struct.pack(">IIB", 2835, 2835, 1))
        + chunk(b"tEXt", b"Comment\x00fixture text chunk")
        + chunk(b"zTXt", b"Software\x00" + b"\x00" + zlib.compress(b"fixture compressed text"))
        + chunk(b"iTXt", b"Title\x00\x00\x00\x00\x00" + "fixture international text".encode("utf-8"))
        + chunk(b"tIME", struct.pack(">HBBBBB", 2026, 11, 24, 12, 0, 0))
    )


def write_png(path: str, color_type: int, rows: list, ancillary: bytes, palette: bytes = b"") -> None:
    header = struct.pack(">IIBBBBB", SIZE, SIZE, 8, color_type, 0, 0, 0)
    body = b"".join(b"\x00" + row for row in rows)
    png = (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", header)
        + palette
        + ancillary
        + metadata_chunks()
        + chunk(b"IDAT", zlib.compress(body, 9))
        + chunk(b"IEND", b"")
    )
    with open(path, "wb") as handle:
        handle.write(png)


def rgba_frame(index: int) -> list:
    rows = []
    for y in range(SIZE):
        row = bytearray()
        for x in range(SIZE):
            inside = 8 + index * 8 <= x < 40 + index * 8 and 12 <= y < 52
            alpha = (x * 4 + y * 2 + index * 37) % 256 if inside else 0
            row.extend((40 + index * 60, 220 - y * 2, (x * 3) % 256, alpha))
        rows.append(bytes(row))
    return rows


def palette_frame(index: int) -> list:
    rows = []
    for y in range(SIZE):
        row = bytearray()
        for x in range(SIZE):
            row.append(((x // 8) + (y // 8) + index) % 4)
        rows.append(bytes(row))
    return rows


PALETTE = bytes((18, 28, 48, 40, 220, 180, 240, 200, 60, 255, 255, 255))
TRANSPARENCY = bytes((255, 128, 255, 255))

directory = sys.argv[1]
os.makedirs(directory, exist_ok=True)
for index in range(3):
    write_png(os.path.join(directory, f"rgba{index:03d}.png"), 6, rgba_frame(index), b"")
    write_png(
        os.path.join(directory, f"palette{index:03d}.png"),
        3,
        palette_frame(index),
        chunk(b"tRNS", TRANSPARENCY),
        chunk(b"PLTE", PALETTE),
    )
