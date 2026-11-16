import hashlib
import json
import os
import platform
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / "output"
EXPECTED = ROOT / "expected" / "result.json"
CLI = os.environ.get("RAWTHERAPEE_CLI", "rawtherapee-cli")


def require(condition, message):
    if not condition:
        raise RuntimeError(message)


probe = subprocess.run([CLI, "-v"], capture_output=True, text=True)
version_output = probe.stdout + probe.stderr
version_line = next((line.strip() for line in version_output.splitlines() if "RawTherapee, version" in line), "")
require(version_line == "RawTherapee, version 5.13, command line.", f"Unexpected RawTherapee CLI version probe: {version_line!r}")

input_path = (OUTPUT / "input.png").resolve()
require(input_path.is_file(), f"Missing generated input {input_path}; run generate.py first")
runs = []
for index in (1, 2):
    destination = (OUTPUT / f"run-{index}").resolve()
    destination.mkdir(parents=True, exist_ok=True)
    command = [CLI, "-q", "-n", "-b8", "-o", str(destination), "-Y", "-c", str(input_path)]
    result = subprocess.run(command, cwd=ROOT, capture_output=True, text=True)
    (OUTPUT / f"run-{index}.log").write_text(result.stdout + result.stderr)
    require(result.returncode == 0, f"RawTherapee run {index} failed ({result.returncode}):\n{result.stdout}\n{result.stderr}")
    converted = destination / "input.png"
    require(converted.is_file(), f"Expected output not found: {converted}")
    inspected = subprocess.run(
        ["magick", "identify", "-format", "%w %h %k", str(converted)],
        capture_output=True,
        text=True,
        check=True,
    ).stdout
    fields = inspected.split()
    require(len(fields) == 3, f"Unexpected ImageMagick identify result: {inspected!r}")
    width, height, colors = map(int, fields)
    require((width, height) == (64, 48), f"Unexpected output dimensions: {(width, height)}")
    require(colors > 16, f"Output has too few distinct colors: {colors}")
    runs.append({
        "dimensions": [width, height],
        "distinct_colors": colors,
        "sha256": hashlib.sha256(converted.read_bytes()).hexdigest(),
    })

require(runs[0] == runs[1], f"Independent RawTherapee exports differ: {runs}")
metrics = {
    "rawtherapee_cli": version_line,
    "host": platform.platform(),
    "input_dimensions": [64, 48],
    "output_format": "PNG, 8-bit per channel",
    "runs": runs,
    "repeat_bytes_match": True,
}
rendered = json.dumps(metrics, indent=2) + "\n"
if "--record" in sys.argv[1:]:
    EXPECTED.parent.mkdir(parents=True, exist_ok=True)
    EXPECTED.write_text(rendered)
else:
    require(EXPECTED.is_file(), f"Missing {EXPECTED}; rerun with --record after reviewing measurements")
    require(json.loads(EXPECTED.read_text()) == metrics, f"Observed metrics differ from expected/result.json:\n{rendered}")
print(rendered, end="")
