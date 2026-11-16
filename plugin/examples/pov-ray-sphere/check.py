#!/usr/bin/env python3
import hashlib
import json
import subprocess
import sys
from pathlib import Path

root = Path(__file__).parent
png = root / "output" / "sphere.png"
version, mode = sys.argv[1], sys.argv[2]
width, height, channels = 128, 96, 3
identify = subprocess.check_output(["magick", "identify", "-format", "%w %h %[channels]", str(png)], text=True)
assert identify.split()[:3] == ["128", "96", "srgb"], f"unexpected PNG properties: {identify!r}"
pixels = subprocess.check_output(["magick", str(png), "-depth", "8", "RGB:-"])
assert len(pixels) == width * height * channels, f"unexpected raw RGB length: {len(pixels)}"
background = pixels[:3]
changed = []
for y in range(height):
    for x in range(width):
        i = (y * width + x) * 3
        rgb = pixels[i:i + 3]
        if any(abs(a - b) > 8 for a, b in zip(rgb, background)):
            changed.append((x, y))
assert len(changed) > 1000, f"only {len(changed)} pixels differ meaningfully from corner background"
xs, ys = zip(*changed)
red_sphere = []
for y in range(height):
    for x in range(width):
        i = (y * width + x) * 3
        r, g, b = pixels[i:i + 3]
        if r > g * 1.35 and r > b * 1.25 and r > 60:
            red_sphere.append((x, y))
assert len(red_sphere) > 1000, f"sphere-colored pixels missing: {len(red_sphere)}"
rx, ry = zip(*red_sphere)
metrics = {
    "povRayVersion": version,
    "width": width,
    "height": height,
    "channels": "RGB",
    "changedPixels": len(changed),
    "changedBounds": [min(xs), min(ys), max(xs), max(ys)],
    "sphereRedPixels": len(red_sphere),
    "sphereRedBounds": [min(rx), min(ry), max(rx), max(ry)],
    "rgbSha256": hashlib.sha256(pixels).hexdigest(),
}
assert 0 <= metrics["changedBounds"][0] <= metrics["changedBounds"][2] < width
assert 0 <= metrics["changedBounds"][1] <= metrics["changedBounds"][3] < height
assert 0 <= metrics["sphereRedBounds"][0] <= metrics["sphereRedBounds"][2] < width
assert 0 <= metrics["sphereRedBounds"][1] <= metrics["sphereRedBounds"][3] < height
expected = root / "expected" / "metrics.json"
if mode == "--record":
    expected.write_text(json.dumps(metrics, indent=2) + "\n")
else:
    assert json.loads(expected.read_text()) == metrics, "render metrics differ from expected"
print(json.dumps(metrics, indent=2))
