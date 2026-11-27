"""Decode two 8-bit RGBA PNGs with the standard library and print RGBA PSNR and max error as JSON."""
import json, math, struct, sys, zlib


def decode(path):
    data = open(path, "rb").read()
    pos, idat = 8, b""
    while pos < len(data):
        length, kind = struct.unpack(">I4s", data[pos:pos + 8])
        body = data[pos + 8:pos + 8 + length]
        if kind == b"IHDR":
            w, h, depth, ctype, _, _, interlace = struct.unpack(">IIBBBBB", body)
            assert (depth, ctype, interlace) == (8, 6, 0), "need 8-bit non-interlaced RGBA"
        elif kind == b"IDAT":
            idat += body
        pos += 12 + length
    raw, stride, prev, rows = zlib.decompress(idat), w * 4, bytearray(w * 4), []
    for y in range(h):
        f = raw[y * (stride + 1)]
        line = bytearray(raw[y * (stride + 1) + 1:(y + 1) * (stride + 1)])
        for i in range(stride):
            a = line[i - 4] if i >= 4 else 0
            b = prev[i]
            c = prev[i - 4] if i >= 4 else 0
            if f == 1:
                line[i] = (line[i] + a) & 255
            elif f == 2:
                line[i] = (line[i] + b) & 255
            elif f == 3:
                line[i] = (line[i] + (a + b) // 2) & 255
            elif f == 4:
                p = a + b - c
                pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
                line[i] = (line[i] + (a if pa <= pb and pa <= pc else b if pb <= pc else c)) & 255
        rows.append(line)
        prev = line
    return w, h, b"".join(rows)


wa, ha, a = decode(sys.argv[1])
wb, hb, b = decode(sys.argv[2])
assert (wa, ha) == (wb, hb), "size mismatch"
sq = sum((x - y) ** 2 for x, y in zip(a, b))
print(json.dumps({
    "width": wa,
    "height": ha,
    "psnr_db": round(10 * math.log10(255 ** 2 / (sq / len(a))), 1) if sq else 99.0,
    "max_abs_error": max(abs(x - y) for x, y in zip(a, b)),
}))
