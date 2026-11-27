"""Predeclared checks for halftonecv: screen angle, pitch, plate isolation, determinism."""
import hashlib
import json
import math
import subprocess
import sys
from pathlib import Path

import numpy as np
from PIL import Image

HERE = Path(__file__).resolve().parent
WORK = HERE / "output" / "work"
BIN = Path(sys.executable).parent / "halftonecv"
PITCH_PX = 8
SCALE = 2
ANGLES_CMYK = {"c": 15, "m": 75, "y": 0, "k": 45}
GRAY_ANGLE = 45
ANGLE_TOLERANCE_DEG = 2.0
PITCH_TOLERANCE_PX = 1.0  # output pixels; expected pitch is PITCH_PX * SCALE
KEEP = {"c": "myk", "m": "cyk", "y": "cmk", "k": "cmy"}
FLAG = {"c": "--keep-cyan", "m": "--keep-magenta", "y": "--keep-yellow", "k": "--keep-key"}


def run_halftone(source: Path, out_dir: Path, extra: list[str]) -> Path:
    command = [str(BIN), "-q", "-f", "-p", str(PITCH_PX), "-x", str(SCALE), "-d", str(out_dir), "--discard", *extra, str(source)]
    subprocess.run(command, check=True)
    return out_dir / f"{source.stem}-halftone.png"


def screen_peak(path: Path) -> tuple[float, float]:
    """Dominant lattice direction in degrees (mod 90) and its period in pixels."""
    pixels = np.asarray(Image.open(path).convert("L"), dtype=float)
    pixels -= pixels.mean()
    size = pixels.shape[0]
    window = np.outer(np.hanning(size), np.hanning(size))
    spectrum = np.abs(np.fft.fftshift(np.fft.fft2(pixels * window)))
    centre = size // 2
    spectrum[centre - 2 : centre + 3, centre - 2 : centre + 3] = 0
    row, column = np.unravel_index(spectrum.argmax(), spectrum.shape)
    dy, dx = row - centre, column - centre
    return math.degrees(math.atan2(-dy, dx)) % 90, size / math.hypot(dx, dy)


def angle_error(measured: float, expected: float) -> float:
    delta = abs(measured - expected) % 90
    return min(delta, 90 - delta)


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main() -> None:
    WORK.mkdir(parents=True, exist_ok=True)
    gray_source = WORK / "gray.png"
    colour_source = WORK / "mid.png"
    Image.new("L", (256, 256), 128).save(gray_source)
    Image.new("RGB", (256, 256), (90, 70, 60)).save(colour_source)

    checks: dict[str, object] = {}
    expected_pitch = PITCH_PX * SCALE

    gray_out = run_halftone(gray_source, WORK / "gray", ["-A", str(GRAY_ANGLE)])
    gray_again = run_halftone(gray_source, WORK / "gray-again", ["-A", str(GRAY_ANGLE)])
    angle, period = screen_peak(gray_out)
    gray_mean = float(np.asarray(Image.open(gray_out)).mean())
    checks["gray_size_is_input_times_scale"] = Image.open(gray_out).size == (256 * SCALE, 256 * SCALE)
    checks["gray_angle_within_tolerance"] = angle_error(angle, GRAY_ANGLE) <= ANGLE_TOLERANCE_DEG
    checks["gray_pitch_within_tolerance"] = abs(period - expected_pitch) <= PITCH_TOLERANCE_PX
    checks["gray_tone_within_5_percent_of_input"] = abs(gray_mean - 128) / 255 <= 0.05
    checks["gray_output_byte_identical_on_repeat"] = sha256(gray_out) == sha256(gray_again)

    plate_angles: dict[str, float] = {}
    plate_errors: dict[str, float] = {}
    for plate, expected in ANGLES_CMYK.items():
        keep = [FLAG[other] for other in "cmyk" if other != plate]
        out = run_halftone(colour_source, WORK / f"plate-{plate}", ["-a", *map(str, ANGLES_CMYK.values()), *keep])
        measured, plate_period = screen_peak(out)
        plate_angles[plate] = round(measured, 1)
        plate_errors[plate] = round(angle_error(measured, expected), 1)
        checks[f"plate_{plate}_angle_within_tolerance"] = plate_errors[plate] <= ANGLE_TOLERANCE_DEG
        checks[f"plate_{plate}_pitch_within_tolerance"] = abs(plate_period - expected_pitch) <= PITCH_TOLERANCE_PX

    all_passed = all(value is True for value in checks.values())
    report = {
        "gray": {"measured_angle_deg": round(angle, 1), "period_px": round(period, 2), "mean_level": round(gray_mean, 1)},
        "plate_measured_angle_deg": plate_angles,
        "plate_angle_error_deg": plate_errors,
        "checks": checks,
        "failed": [name for name, ok in checks.items() if ok is not True],
        "all_passed": all_passed,
    }
    print(json.dumps(report, indent=2, sort_keys=True))


main()
