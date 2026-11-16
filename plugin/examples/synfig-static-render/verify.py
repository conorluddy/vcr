import hashlib
import json
from pathlib import Path
import subprocess
import sys

first_path, second_path = map(Path, sys.argv[1:3])
expected_path = Path(sys.argv[3])
record = "--record" in sys.argv[4:]


def inspect(path):
    output = subprocess.run([
        "magick", str(path), "-format", "%wx%h %[pixel:p{80,60}] %[pixel:p{5,5}]", "info:",
    ], check=True, capture_output=True, text=True).stdout
    dimensions, center, corner = output.split()
    width, height = map(int, dimensions.split("x"))
    if (width, height) != (160, 120):
        raise SystemExit(f"unexpected PNG dimensions: {width}x{height}")
    if center != "srgba(255,0,0,1)" or corner != "srgba(0,0,0,0)":
        raise SystemExit(f"unexpected center/corner pixels: {center}, {corner}")
    data = path.read_bytes()
    return {"width": width, "height": height, "center_rgba": [255, 0, 0, 255], "corner_rgba": [0, 0, 0, 0], "png_sha256": hashlib.sha256(data).hexdigest()}, data


first, first_bytes = inspect(first_path)
second, second_bytes = inspect(second_path)
if first_bytes != second_bytes:
    raise SystemExit("repeated Synfig PNG renders differ")
result = {"tool": "Synfig", "version": "1.5.5", "renderer": "CLI PNG target", "time": "0s", "render": first, "repeat_sha256_equal": True}
if record:
    expected_path.parent.mkdir(parents=True, exist_ok=True)
    expected_path.write_text(json.dumps(result, indent=2) + "\n")
else:
    expected = json.loads(expected_path.read_text())
    for key in ("version", "renderer", "time", "render", "repeat_sha256_equal"):
        if result[key] != expected[key]:
            raise SystemExit(f"{key} differs from expected: {result[key]} != {expected[key]}")
print(json.dumps(result, indent=2))
