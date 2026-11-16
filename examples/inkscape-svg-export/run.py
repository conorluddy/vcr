import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys

root = Path(__file__).parent
output = root / "output"
expected_path = root / "expected" / "export.json"
record = "--record" in sys.argv[1:]
inkscape = os.environ.get("INKSCAPE_BIN") or shutil.which("inkscape") or "/opt/homebrew/bin/inkscape"
shutil.rmtree(output, ignore_errors=True)
output.mkdir(parents=True)


def run(args):
    result = subprocess.run(args, check=True, capture_output=True, text=True, timeout=60)
    return result.stdout.strip(), result.stderr.strip()


version_text, _ = run([inkscape, "--version"])
version = version_text.split()[1]
if version != "1.4.4":
    raise SystemExit(f"Expected Inkscape 1.4.4, found {version_text}")

renders = []
for name in ("first.png", "second.png"):
    target = output / name
    _, stderr = run([
        inkscape, str(root / "input.svg"),
        "--export-area-page", "--export-width=128", "--export-height=96",
        f"--export-filename={target}",
    ])
    pixel_text, _ = run([
        "magick", str(target), "-format", "%wx%h %[pixel:p{64,48}] %[pixel:p{32,12}] %[pixel:p{4,4}]", "info:",
    ])
    dimensions, center, ring, corner = pixel_text.split()
    width, height = map(int, dimensions.split("x"))
    if (width, height) != (128, 96):
        raise SystemExit(f"Unexpected PNG dimensions: {width}x{height}")
    if center != "srgba(21,101,192,1)" or ring != "srgba(229,57,53,1)" or corner != "srgba(0,0,0,0)":
        raise SystemExit(f"Unexpected pixel samples: center={center}, red={ring}, corner={corner}")
    data = target.read_bytes()
    renders.append({"width": width, "height": height, "center_rgba": [21, 101, 192, 255], "red_rgba": [229, 57, 53, 255], "corner_rgba": [0, 0, 0, 0], "png_sha256": hashlib.sha256(data).hexdigest()})
    if stderr:
        print(f"Inkscape export note ({name}): {stderr}", file=sys.stderr)
if renders[0] != renders[1]:
    raise SystemExit("Repeated Inkscape exports differ")
result = {"tool": "Inkscape", "version": version, "command": "CLI SVG page export to PNG", "renders": renders, "repeat_equal": True}
if record:
    expected_path.parent.mkdir(parents=True, exist_ok=True)
    expected_path.write_text(json.dumps(result, indent=2) + "\n")
else:
    expected = json.loads(expected_path.read_text())
    if result != expected:
        raise SystemExit(f"Export result differs from expected: {result} != {expected}")
print(json.dumps(result, indent=2))
