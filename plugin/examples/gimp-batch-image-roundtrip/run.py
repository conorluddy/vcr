import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys

root = Path(__file__).parent
output = root / "output"
expected_path = root / "expected" / "roundtrip.json"
record = "--record" in sys.argv[1:]
gimp = os.environ.get("GIMP_BIN") or shutil.which("gimp") or "/opt/homebrew/bin/gimp"
shutil.rmtree(output, ignore_errors=True)
output.mkdir(parents=True)

version_result = subprocess.run([gimp, "--version"], check=True, capture_output=True, text=True, timeout=30)
match = re.search(r"version\s+([\d.]+)", version_result.stdout + version_result.stderr)
if not match or match.group(1) != "3.2.8":
    raise SystemExit(f"Expected GIMP 3.2.8, found {(version_result.stdout + version_result.stderr).strip()}")

width, height = 16, 12
pixels = bytearray()
for y in range(height):
    for x in range(width):
        if 2 <= x < 8 and 2 <= y < 10:
            pixels.extend((231, 76, 60))
        elif 8 <= x < 14 and 2 <= y < 10:
            pixels.extend((52, 152, 219))
        else:
            pixels.extend((18, 26, 34))
input_path, output_path = output / "input.ppm", output / "exported.png"
input_path.write_bytes(f"P6\n{width} {height}\n255\n".encode() + pixels)
python_batch = f'''from gi.repository import Gimp, Gio
image = Gimp.file_load(Gimp.RunMode.NONINTERACTIVE, Gio.File.new_for_path({str(input_path)!r}))
procedure = Gimp.get_pdb().lookup_procedure("file-png-export")
config = procedure.create_config()
config.set_property("run-mode", Gimp.RunMode.NONINTERACTIVE)
config.set_property("image", image)
config.set_property("file", Gio.File.new_for_path({str(output_path)!r}))
result = procedure.run(config)
print("PNG_EXPORT_STATUS", result.index(0))
'''
batch = subprocess.run([
    gimp, "--no-interface", "--no-data", "--no-fonts", "--no-splash", "--console-messages", "-n",
    "--batch-interpreter=python-fu-eval", "--batch=" + python_batch, "--quit",
], capture_output=True, text=True, timeout=60)
if batch.returncode != 0:
    raise SystemExit(f"GIMP batch failed ({batch.returncode}):\n{batch.stdout}\n{batch.stderr}")
if not output_path.exists():
    raise SystemExit(f"GIMP batch exited successfully but did not write {output_path}:\n{batch.stdout}\n{batch.stderr}")

pixel_text = subprocess.run([
    "magick", str(output_path), "-format", "%wx%h %[pixel:p{4,5}] %[pixel:p{11,5}] %[pixel:p{0,0}]", "info:",
], check=True, capture_output=True, text=True).stdout
dimensions, red, blue, background = pixel_text.split()
if dimensions != "16x12" or red != "srgb(231,76,60)" or blue != "srgb(52,152,219)" or background != "srgb(18,26,34)":
    raise SystemExit(f"Unexpected PNG dimensions or samples: {pixel_text}")
pixels_rgb = subprocess.run([
    "magick", str(output_path), "-alpha", "off", "-depth", "8", "RGB:-",
], check=True, capture_output=True).stdout
result = {
    "tool": "GIMP",
    "version": match.group(1),
    "batch_interpreter": "python-fu-eval",
    "operation": "load PPM and export PNG",
    "width": width,
    "height": height,
    "samples": {"red": [231, 76, 60], "blue": [52, 152, 219], "background": [18, 26, 34]},
    "decoded_rgb_sha256": hashlib.sha256(pixels_rgb).hexdigest(),
    "exit_code": batch.returncode,
}
if record:
    expected_path.parent.mkdir(parents=True, exist_ok=True)
    expected_path.write_text(json.dumps(result, indent=2) + "\n")
else:
    expected = json.loads(expected_path.read_text())
    if result != expected:
        raise SystemExit(f"Roundtrip differs from expected: {result} != {expected}")
print(json.dumps(result, indent=2))
