import hashlib
import json
import math
from pathlib import Path
import sys

WIDTH = 64
HEIGHT = 48
FRAME_BYTES = WIDTH * HEIGHT * 4
VARIANTS = ["control", "invert", "invert2", "bright025", "bright050", "bright075"]
PROBES = [(0, 0), (63, 0), (0, 47), (63, 47), (31, 24), (32, 24), (31, 23), (32, 23),
          (16, 12), (48, 12), (16, 36), (48, 36)]
QUADRANT_COLOURS = {
    (False, False): (255, 0, 0),
    (True, False): (0, 255, 0),
    (False, True): (0, 0, 255),
    (True, True): (128, 64, 32),
}


# === PUBLIC API ===

def main() -> None:
    if len(sys.argv) >= 3 and sys.argv[1] == "make-input":
        make_input(Path(sys.argv[2]))
        return
    if len(sys.argv) >= 6 and sys.argv[1] == "check":
        run_checks(Path(sys.argv[2]), Path(sys.argv[3]), sys.argv[4], sys.argv[5], "--record" in sys.argv[6:])
        return
    raise SystemExit("usage: verify.py make-input <ppm> | verify.py check <outdir> <expected.json> <melt> <frei0r> [--record]")


def make_input(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(f"P6\n{WIDTH} {HEIGHT}\n255\n".encode() + input_rgb_bytes())


def run_checks(output_dir: Path, expected_path: Path, melt_version: str, frei0r_version: str, record: bool) -> None:
    frames = {}
    hashes = {}
    for variant in VARIANTS:
        first = read_frame(output_dir / f"{variant}-a.rgba")
        second = read_frame(output_dir / f"{variant}-b.rgba")
        require(first == second, f"{variant}: reruns differ (a and b are not byte-identical)")
        frames[variant] = rgba_pixels(first)
        hashes[variant] = hashlib.sha256(first).hexdigest()

    sources = [QUADRANT_COLOURS[(x >= WIDTH // 2, y >= HEIGHT // 2)] for y in range(HEIGHT) for x in range(WIDTH)]
    compare_frame("control", frames["control"], sources, lambda value: value, 0)
    compare_frame("invert", frames["invert"], sources, lambda value: 255 - value, 0)
    compare_frame("invert2", frames["invert2"], sources, lambda value: value, 0)
    compare_frame("bright050", frames["bright050"], sources, lambda value: value, 1)
    compare_frame("bright025", frames["bright025"], sources, lambda value: math.floor(value * 0.5), 1)
    compare_frame("bright075", frames["bright075"], sources, lambda value: round(value + (255 - value) * 0.5), 1)
    check_direction(frames["bright025"], frames["bright050"], frames["bright075"])

    probes = {
        variant: {f"{x},{y}": list(frames[variant][y * WIDTH + x]) for x, y in PROBES}
        for variant in VARIANTS
    }
    result = {
        "tool": "frei0r",
        "melt_version": melt_version,
        "frei0r_version": frei0r_version,
        "sha256": hashes,
        "probes": probes,
    }
    if record:
        expected_path.parent.mkdir(parents=True, exist_ok=True)
        expected_path.write_text(json.dumps(result, indent=2) + "\n")
        print("recorded expected/render.json")
        return
    expected = json.loads(expected_path.read_text())
    for key in ("melt_version", "frei0r_version", "sha256", "probes"):
        require(expected.get(key) == result[key], f"{key} differs from expected/render.json")
    print("OK")


# === HELPERS ===

def input_rgb_bytes() -> bytes:
    return bytes(channel for y in range(HEIGHT) for x in range(WIDTH)
                 for channel in QUADRANT_COLOURS[(x >= WIDTH // 2, y >= HEIGHT // 2)])


def read_frame(path: Path) -> bytes:
    require(path.exists(), f"missing output {path}")
    data = path.read_bytes()
    require(len(data) == FRAME_BYTES, f"{path.name}: {len(data)} bytes, expected one {WIDTH}x{HEIGHT} RGBA frame ({FRAME_BYTES})")
    return data


def rgba_pixels(frame: bytes) -> list[tuple[int, int, int, int]]:
    return [tuple(frame[index:index + 4]) for index in range(0, FRAME_BYTES, 4)]


def compare_frame(name: str, pixels: list[tuple[int, int, int, int]], sources: list[tuple[int, int, int]],
                  expected_channel, tolerance: int) -> None:
    for index, (pixel, source) in enumerate(zip(pixels, sources)):
        x, y = index % WIDTH, index // WIDTH
        require(pixel[3] == 255, f"{name}: alpha {pixel[3]} at ({x},{y}), expected 255")
        for channel in range(3):
            expected = expected_channel(source[channel])
            require(abs(pixel[channel] - expected) <= tolerance,
                    f"{name}: channel {channel} at ({x},{y}) is {pixel[channel]}, expected {expected} ±{tolerance} from source {source}")


def check_direction(quarter, half, three_quarter) -> None:
    for index, (low, mid, high) in enumerate(zip(quarter, half, three_quarter)):
        x, y = index % WIDTH, index // WIDTH
        for channel in range(3):
            require(low[channel] <= mid[channel] <= high[channel] and high[channel] > low[channel],
                    f"brightness direction wrong at ({x},{y}) channel {channel}: 0.25={low[channel]} 0.5={mid[channel]} 0.75={high[channel]}")


def require(condition: bool, message: str) -> None:
    if not condition:
        raise SystemExit(f"FAIL: {message}")


main()
