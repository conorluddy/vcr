#!/usr/bin/env python3
import hashlib
import json
import subprocess
from pathlib import Path

root = Path(__file__).parent
image = root / "output/field.png"
render = root / "output/render.png"
version = subprocess.check_output(["msdfgen", "-version"], text=True).splitlines()[0].split()[-1]
field_info = subprocess.check_output(["magick", "identify", "-format", "%wx%h %[channels]", str(image)], text=True)
render_info = subprocess.check_output(["magick", "identify", "-format", "%wx%h %[channels]", str(render)], text=True)
pixel_stats = subprocess.check_output(["magick", str(image), "-format", "%[fx:minima] %[fx:maxima]", "info:"], text=True)
minimum, maximum = map(float, pixel_stats.split())
assert version == "v1.13.1", version
assert field_info.startswith("64x64 "), field_info
assert "srgba" in field_info.lower() or "rgb" in field_info.lower(), field_info
assert render_info.startswith("256x256 "), render_info
assert minimum < maximum, pixel_stats
result = {
    "version": version,
    "field": field_info,
    "render": render_info,
    "channel_min": minimum,
    "channel_max": maximum,
    "field_sha256": hashlib.sha256(image.read_bytes()).hexdigest(),
}
print(json.dumps(result, indent=2))
