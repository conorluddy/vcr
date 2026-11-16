#!/usr/bin/env python3
import hashlib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).parent


def read_pgm(path):
    data = path.read_bytes()
    tokens = []
    pos = 0
    while len(tokens) < 4:
        while pos < len(data) and data[pos] in b" \t\r\n":
            pos += 1
        if data[pos:pos + 1] == b"#":
            while pos < len(data) and data[pos] not in b"\r\n":
                pos += 1
            continue
        match = re.match(rb"\S+", data[pos:])
        if not match:
            raise ValueError("truncated PGM header")
        tokens.append(match.group())
        pos += len(match.group())
    magic, width, height, maxval = tokens
    width, height, maxval = int(width), int(height), int(maxval)
    if magic == b"P5":
        while pos < len(data) and data[pos] in b" \t\r\n":
            pos += 1
        pixels = list(data[pos:])
    elif magic == b"P2":
        pixels = [int(value) for value in re.findall(rb"\d+", data[pos:])]
    else:
        raise ValueError(f"unsupported PGM magic {magic!r}")
    if len(pixels) != width * height:
        raise ValueError(f"expected {width * height} pixels, found {len(pixels)}")
    return {"format": magic.decode(), "width": width, "height": height, "maxval": maxval, "pixels": pixels}


def main():
    output = read_pgm(ROOT / "output/negated.pgm")
    repeated_bytes = (ROOT / "output/repeat.pgm").read_bytes()
    output_bytes = (ROOT / "output/negated.pgm").read_bytes()
    if repeated_bytes != output_bytes:
        raise SystemExit("repeat output bytes differ")
    if output["width"] != 2 or output["height"] != 2 or output["maxval"] != 255:
        raise SystemExit(f"unexpected output geometry/range: {output}")
    if output["pixels"] != [255, 191, 127, 0]:
        raise SystemExit(f"unexpected exact pixels: {output['pixels']}")
    metrics = {**output, "gmic_version": "4.0.7", "sha256": hashlib.sha256(output_bytes).hexdigest(), "repeat_match": True}
    expected = ROOT / "expected/metrics.json"
    if len(sys.argv) > 1 and sys.argv[1] == "--record":
        expected.write_text(json.dumps(metrics, indent=2) + "\n")
        print("recorded expected/metrics.json")
    else:
        if json.loads(expected.read_text()) != metrics:
            raise SystemExit(f"metrics differ from expected: {metrics}")
        print("g-mic-negate: OK")


if __name__ == "__main__":
    main()
