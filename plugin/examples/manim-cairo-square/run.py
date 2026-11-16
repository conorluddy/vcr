import hashlib
import json
import os
import platform
import subprocess
import sys
from pathlib import Path

from PIL import Image


HERE = Path(__file__).resolve().parent
OUTPUT = HERE / "output"
EXPECTED = HERE / "expected" / "result.json"
PYTHON = OUTPUT / "venv" / "bin" / "python"
MANIM = OUTPUT / "venv" / "bin" / "manim"
MODE = sys.argv[1] if len(sys.argv) > 1 else ""
if MODE not in ("", "--record"):
    raise SystemExit("usage: run.sh [--record]")
if not PYTHON.exists() or not MANIM.exists():
    raise SystemExit("isolated environment missing; see README.md install instructions")
OUTPUT.mkdir(parents=True, exist_ok=True)


def installed_version(module):
    code = f"import {module}; print({module}.__version__)"
    return subprocess.check_output([str(PYTHON), "-c", code], text=True).strip()


def run_one(index):
    target = OUTPUT / f"run{index}"
    if target.exists():
        import shutil

        shutil.rmtree(target)
    target.mkdir(parents=True)
    command = [
        str(MANIM),
        "render",
        "--renderer=cairo",
        "--format=png-sequence",
        "--resolution=192,108",
        "--frame_rate=12",
        "--disable_caching",
        f"--media_dir={target / 'media'}",
        str(HERE / "scene.py"),
        "SquareTranslate",
    ]
    result = subprocess.run(command, cwd=HERE, capture_output=True, text=True, timeout=180)
    (target / "manim.log").write_text(result.stdout + result.stderr)
    if result.returncode:
        raise RuntimeError(f"Manim CLI failed ({result.returncode}); see {target / 'manim.log'}")
    frames = sorted((target / "media").rglob("*.png"))
    if len(frames) != 12:
        raise AssertionError(f"expected 12 sequence frames, found {len(frames)} under {target}")
    observed = []
    raw_pixels = []
    for frame_path in frames:
        with Image.open(frame_path) as image:
            image.load()
            if image.size != (192, 108):
                raise AssertionError(f"unexpected frame size {image.size}: {frame_path}")
            rgba = image.convert("RGBA")
            pixels = rgba.tobytes()
            raw_pixels.append(pixels)
            red = [
                (x, y)
                for y in range(rgba.height)
                for x in range(rgba.width)
                if (lambda p: p[0] > 200 and p[1] < 100 and p[2] < 100)(rgba.getpixel((x, y)))
            ]
            if not red:
                raise AssertionError(f"no red square pixels in {frame_path}")
            xs = [point[0] for point in red]
            ys = [point[1] for point in red]
            observed.append({
                "file": frame_path.name,
                "width": rgba.width,
                "height": rgba.height,
                "red_pixels": len(red),
                "bbox": [min(xs), min(ys), max(xs) + 1, max(ys) + 1],
                "centroid_x": round(sum(xs) / len(xs), 3),
                "pixel_sha256": hashlib.sha256(pixels).hexdigest(),
            })
    centroids = [frame["centroid_x"] for frame in observed]
    if any(after + 0.5 < before for before, after in zip(centroids[:9], centroids[1:9])):
        raise AssertionError(f"square centroid did not move monotonically: {centroids}")
    shift = centroids[-1] - centroids[0]
    if not 45 <= shift <= 60:
        raise AssertionError(f"expected 45-60 px overall centroid shift, found {shift}")
    if not (raw_pixels[-1] == raw_pixels[-2] == raw_pixels[-3]):
        raise AssertionError("last 3 hold frames are not pixel-identical")
    return {
        "frame_count": len(frames),
        "resolution": [192, 108],
        "frame_rate": 12,
        "duration_seconds": len(frames) / 12,
        "animation_centroids_x": centroids[:9],
        "centroid_shift_pixels": shift,
        "last_3_hold_frames_identical": True,
        "frames": observed,
    }


manim_version = subprocess.check_output([str(MANIM), "--version"], text=True, stderr=subprocess.STDOUT).strip().splitlines()[-1]
if manim_version != "Manim Community v0.22.1":
    raise RuntimeError(f"unexpected Manim version output: {manim_version}")
first = run_one(1)
second = run_one(2)
if first != second:
    raise AssertionError("two Manim CLI runs produced different frame metrics")
metrics = {
    "manim": "0.22.1",
    "python": platform.python_version(),
    "pillow": installed_version("PIL"),
    "native_cairo": subprocess.check_output(["pkg-config", "--modversion", "cairo"], text=True).strip(),
    "native_pango": subprocess.check_output(["pkg-config", "--modversion", "pango"], text=True).strip(),
    "native_ffmpeg": subprocess.check_output(["ffmpeg", "-version"], text=True).splitlines()[0],
    "host": f"{platform.system()} {platform.release()} {platform.machine()}",
    "hostname": platform.node(),
    "renderer": "cairo",
    "format": "png-sequence",
    "runs": 2,
    "repeat_metrics_match": True,
    "first": first,
    "second": second,
}
rendered = json.dumps(metrics, indent=2) + "\n"
if MODE == "--record":
    EXPECTED.parent.mkdir(parents=True, exist_ok=True)
    EXPECTED.write_text(rendered)
    print(f"RECORDED {EXPECTED}")
else:
    if not EXPECTED.exists() or EXPECTED.read_text() != rendered:
        raise AssertionError(f"metrics differ from {EXPECTED}:\n{rendered}")
    print("OK: Manim Cairo frame count, geometry, hold and repeat metrics match expected/result.json")
print(rendered)
