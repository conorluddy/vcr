import struct
import zlib
from pathlib import Path


WIDTH, HEIGHT = 64, 48


def chunk(kind, data):
    return struct.pack(">I", len(data)) + kind + data + struct.pack(">I", zlib.crc32(kind + data) & 0xFFFFFFFF)


rows = []
for y in range(HEIGHT):
    row = bytearray([0])
    for x in range(WIDTH):
        red = 24 + 3 * x
        green = 28 + 4 * y
        blue = 210 - 2 * x
        if 8 <= x < 28 and 8 <= y < 24:
            red, green, blue = 220, 80, 48
        elif 36 <= x < 56 and 26 <= y < 42:
            red, green, blue = 48, 168, 96
        row.extend((red, green, blue))
    rows.append(bytes(row))

png = b"\x89PNG\r\n\x1a\n"
png += chunk(b"IHDR", struct.pack(">IIBBBBB", WIDTH, HEIGHT, 8, 2, 0, 0, 0))
png += chunk(b"IDAT", zlib.compress(b"".join(rows), 9))
png += chunk(b"IEND", b"")
output = Path(__file__).parent / "output" / "input.png"
output.parent.mkdir(parents=True, exist_ok=True)
output.write_bytes(png)
