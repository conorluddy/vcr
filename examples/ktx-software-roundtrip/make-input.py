import math, struct, sys, zlib
w = h = 256
rows = []
for y in range(h):
    row = bytearray([0])
    for x in range(w):
        d = math.hypot(x - 128, y - 128)
        inside = d < 90
        r = int(255 * x / (w - 1)); g = int(255 * y / (h - 1)); b = 200 if inside else 60
        a = 255 if d < 120 else 128
        row += bytes((r, g, b, a))
    rows.append(bytes(row))
def chunk(t, d):
    c = struct.pack(">I", len(d)) + t + d
    return c + struct.pack(">I", zlib.crc32(t + d))
png = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0)) + chunk(b"IDAT", zlib.compress(b"".join(rows), 9)) + chunk(b"IEND", b"")
open(sys.argv[1], "wb").write(png)
