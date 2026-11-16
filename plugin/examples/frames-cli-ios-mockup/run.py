import hashlib
import json
import os
import subprocess
import sys
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / "output"
EXPECTED = ROOT / "expected" / "metrics.json"
FRAMES_CLI = Path(os.environ.get("FRAMES_CLI", OUTPUT / "source/frames-cli-1.7.0/frames")).resolve()
FRAMES_ASSETS = Path(os.environ["FRAMES_ASSETS"])
if not FRAMES_ASSETS.is_absolute():
    FRAMES_ASSETS = ROOT / FRAMES_ASSETS
FRAMES_ASSETS = FRAMES_ASSETS.resolve()
PYTHON = Path(sys.executable)


def require(condition, message):
    if not condition:
        raise RuntimeError(message)


require(FRAMES_CLI.is_file(), f"Frames CLI not found: {FRAMES_CLI}")
require((FRAMES_ASSETS / "NewFrames.json").is_file(), f"FRAMES_ASSETS must contain NewFrames.json: {FRAMES_ASSETS}")
OUTPUT.mkdir(parents=True, exist_ok=True)
subprocess.run([str(PYTHON), str(ROOT / "generate.py")], cwd=ROOT, check=True)

version = subprocess.run([str(PYTHON), str(FRAMES_CLI), "--version"], capture_output=True, text=True, check=True).stdout.strip()
require(version == "frames v1.7.0", f"Unexpected Frames CLI version: {version}")

runs = []
for index in (1, 2):
    destination = OUTPUT / f"run-{index}"
    destination.mkdir(parents=True, exist_ok=True)
    command = [
        str(PYTHON), str(FRAMES_CLI), "--json", "--assets", str(FRAMES_ASSETS),
        "--output", str(destination), str(OUTPUT / "input-screen.png"),
    ]
    completed = subprocess.run(command, cwd=ROOT, capture_output=True, text=True, check=True)
    cli_result = json.loads(completed.stdout)
    framed = destination / "input-screen_framed.png"
    require(framed.is_file(), f"Frames did not produce {framed}")
    with Image.open(framed) as image:
        image.load()
        require(image.format == "PNG", f"Unexpected output format: {image.format}")
        require(image.mode == "RGBA", f"Expected RGBA output, got {image.mode}")
        size = list(image.size)
        require(size[0] > 1206 and size[1] > 2622, f"Unexpected framed size: {size}")
        require(len(image.getcolors(maxcolors=2_000_000) or []) > 16, "Framed image lacks expected non-uniform pixel content")
        require(image.getchannel("A").getextrema()[1] == 255, "Framed output has no opaque pixels")
    digest = hashlib.sha256(framed.read_bytes()).hexdigest()
    require(cli_result["device"] == "iPhone 18 Pro Portrait", f"Unexpected device: {cli_result}")
    require(cli_result["primary_match"] == "iPhone 17 Portrait", f"Unexpected primary match: {cli_result}")
    require(cli_result["dimensions"] == "1206x2622", f"Unexpected source dimensions: {cli_result}")
    require(cli_result["frame_size"] == f"{size[0]}x{size[1]}", f"CLI and PNG dimensions differ: {cli_result}")
    runs.append({
        "device": cli_result["device"],
        "primary_match": cli_result["primary_match"],
        "source_dimensions": cli_result["dimensions"],
        "output_dimensions": size,
        "sha256": digest,
    })

require(runs[0] == runs[1], f"Two framed outputs differ: {runs}")
metrics = {
    "frames_cli": version,
    "python": sys.version.split()[0],
    "pillow": Image.__version__ if hasattr(Image, "__version__") else __import__("PIL").__version__,
    "host": __import__("platform").platform(),
    "input_dimensions": [1206, 2622],
    "asset_pack_sha256": "44e8416a12379e93defcdc85a5cb164aea45b12aaebd9a92f88ee0c954bca79a",
    "runs": runs,
    "repeat_bytes_match": True,
}
rendered = json.dumps(metrics, indent=2) + "\n"
if "--record" in sys.argv[1:]:
    EXPECTED.parent.mkdir(parents=True, exist_ok=True)
    EXPECTED.write_text(rendered)
else:
    require(EXPECTED.is_file(), f"Missing {EXPECTED}; run with --record after reviewing the measurements")
    expected = json.loads(EXPECTED.read_text())
    require(metrics == expected, f"Observed metrics differ from expected/metrics.json:\n{rendered}")
print(rendered, end="")
