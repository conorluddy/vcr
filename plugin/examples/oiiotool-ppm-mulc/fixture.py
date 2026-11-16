#!/usr/bin/env python3
import hashlib
import json
import platform
import re
import socket
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = HERE / "output"
EXPECTED = HERE / "expected" / "result.json"
TOOL = "oiiotool"
VERSION_EXPECTED = "3.2.2.0"


def parse_ppm(path):
    data = path.read_bytes()
    pos = 0

    def token():
        nonlocal pos
        while pos < len(data):
            if data[pos] in b" \t\r\n":
                pos += 1
            elif data[pos] == ord("#"):
                while pos < len(data) and data[pos] not in b"\r\n":
                    pos += 1
            else:
                break
        start = pos
        while pos < len(data) and data[pos] not in b" \t\r\n#":
            pos += 1
        if start == pos:
            raise ValueError("truncated PPM header")
        return data[start:pos].decode("ascii")

    magic = token()
    width = int(token())
    height = int(token())
    maximum = int(token())
    if pos >= len(data) or data[pos] not in b" \t\r\n":
        raise ValueError("PPM header lacks data separator")
    if data[pos:pos + 2] == b"\r\n":
        pos += 2
    else:
        pos += 1
    pixels = data[pos:]
    channels = 3 if magic == "P6" else 1 if magic == "P5" else None
    if channels is None:
        raise ValueError(f"expected binary PPM (P6), got {magic}")
    if maximum > 255:
        raise ValueError(f"expected 8-bit PPM, max value {maximum}")
    if len(pixels) != width * height * channels:
        raise ValueError(f"pixel byte count mismatch: {len(pixels)}")
    return {
        "format": magic,
        "width": width,
        "height": height,
        "channels": channels,
        "max_value": maximum,
        "pixels_rgb": [list(pixels[i:i + 3]) for i in range(0, len(pixels), 3)],
        "bytes_sha256": hashlib.sha256(data).hexdigest(),
    }


def run(argv):
    print("$", " ".join(argv))
    return subprocess.run(argv, check=True, capture_output=True, text=True)


def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else ""
    if mode not in ("", "--record"):
        raise SystemExit("usage: run.sh [--record]")
    OUT.mkdir(parents=True, exist_ok=True)
    version = run([TOOL, "--version"]).stdout.strip()
    if VERSION_EXPECTED not in version:
        raise RuntimeError(f"expected OpenImageIO {VERSION_EXPECTED}, got {version!r}")

    source = OUT / "source.ppm"
    first = OUT / "first.ppm"
    second = OUT / "second.ppm"
    source_pixels = bytes((20, 40, 60, 80, 100, 120, 20, 40, 60, 80, 100, 120))
    source.write_bytes(b"P6\n2 2\n255\n" + source_pixels)
    transform = [TOOL, str(source), "--mulc", "0.5"]
    run(transform + ["-o", str(first)])
    run(transform + ["-o", str(second)])
    metadata = run([TOOL, "--info", "-v", str(first)]).stdout
    (OUT / "oiiotool-info.txt").write_text(metadata)

    source_meta = parse_ppm(source)
    actual = parse_ppm(first)
    second_bytes = second.read_bytes()
    first_bytes = first.read_bytes()
    if first_bytes != second_bytes:
        raise RuntimeError("repeated oiiotool output differs byte-for-byte")
    expected_pixels = [[10, 20, 30], [40, 50, 60], [10, 20, 30], [40, 50, 60]]
    if actual["pixels_rgb"] != expected_pixels:
        raise RuntimeError(f"wrong multiply-by-0.5 pixel values: {actual['pixels_rgb']}")
    for key, expected in (("format", "P6"), ("width", 2), ("height", 2), ("channels", 3), ("max_value", 255)):
        if actual[key] != expected:
            raise RuntimeError(f"unexpected output metadata {key}={actual[key]!r}")

    import shutil
    magick = shutil.which("magick")
    if magick:
        subprocess.run([magick, str(first), str(OUT / "preview.png")], check=True)

    metrics = {
        "tool_version": version,
        "python": platform.python_version(),
        "host": f"{platform.system()} {platform.release()} {platform.machine()}",
        "hostname": socket.gethostname(),
        "input": source_meta,
        "output": actual,
        "expected_mulc_half_pixels_rgb": expected_pixels,
        "repeat_matches": True,
        "repeat_sha256": hashlib.sha256(first_bytes).hexdigest(),
        "oiiotool_info_contains_dimensions": bool(re.search(r"\b2\s*x\s+2\b", metadata)),
    }
    if not metrics["oiiotool_info_contains_dimensions"]:
        raise RuntimeError(f"oiiotool --info -v did not report 2x2 dimensions:\n{metadata}")
    rendered = json.dumps(metrics, indent=2, sort_keys=True) + "\n"
    if mode == "--record":
        EXPECTED.parent.mkdir(parents=True, exist_ok=True)
        EXPECTED.write_text(rendered)
        print(f"RECORDED {EXPECTED}")
    else:
        if EXPECTED.read_text() != rendered:
            raise RuntimeError(f"metrics differ from {EXPECTED}:\n{rendered}")
        print("OK: oiiotool pixels, metadata and repeat output match expected/result.json")
    print(rendered, end="")


if __name__ == "__main__":
    main()
