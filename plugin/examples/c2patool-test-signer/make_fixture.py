#!/usr/bin/env python3
import hashlib
import json
import struct
import zlib
from pathlib import Path

ROOT = Path(__file__).parent
OUT = ROOT / "output"
OUT.mkdir(parents=True, exist_ok=True)
WIDTH, HEIGHT = 64, 48

def chunk(kind, data):
    body = kind + data
    return struct.pack(">I", len(data)) + body + struct.pack(">I", zlib.crc32(body) & 0xffffffff)

rows = []
for y in range(HEIGHT):
    row = bytearray([0])
    for x in range(WIDTH):
        if 12 <= x < 52 and 8 <= y < 40:
            row.extend((32 + x * 2, 180 - y, 220 - x))
        else:
            row.extend((232, 238, 246))
    rows.append(bytes(row))
png = bytes.fromhex("89504e470d0a1a0a")
png += chunk(b"IHDR", struct.pack(">IIBBBBB", WIDTH, HEIGHT, 8, 2, 0, 0, 0))
png += chunk(b"IDAT", zlib.compress(b"".join(rows), 9))
png += chunk(b"IEND", b"")
asset = OUT / "source.png"
asset.write_bytes(png)

manifest = {
    "alg": "es256",
    "claim_generator_info": [{"name": "VCRFixture", "version": "1.0"}],
    "title": "VCR c2patool fixture",
    "assertions": [
        {
            "label": "org.contentauth.test",
            "data": {
                "fixture": "c2patool-test-signer",
                "claim": "local test asset only",
            },
        }
    ],
}
(OUT / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
summary = {"width": WIDTH, "height": HEIGHT, "sourceSha256": hashlib.sha256(png).hexdigest()}
(OUT / "source-summary.json").write_text(json.dumps(summary, indent=2) + "\n")
