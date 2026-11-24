#!/usr/bin/env python3
import hashlib
import json
import math
import os
import subprocess
import sys

EXPECTED_WIDTH = 64
EXPECTED_HEIGHT = 64
PSNR_FLOOR_DB = 35.0


def run_text(command: list[str]) -> str:
    result = subprocess.run(command, capture_output=True, text=True, check=True)
    lines = [line for line in (result.stdout + result.stderr).splitlines() if line.strip()]
    return lines[0].strip() if lines else ""


def dimensions(path: str) -> tuple[int, int]:
    width, height = run_text(["magick", "identify", "-format", "%w %h", path]).split()
    return int(width), int(height)


def rgba_bytes(path: str) -> bytes:
    result = subprocess.run(["magick", path, "-depth", "8", "RGBA:-"], capture_output=True, check=True)
    expected_length = EXPECTED_WIDTH * EXPECTED_HEIGHT * 4
    assert len(result.stdout) == expected_length, f"{path}: raw RGBA is {len(result.stdout)} bytes, expected {expected_length}"
    return result.stdout


def alpha_summary(data: bytes) -> dict[str, int]:
    alpha = data[3::4]
    return {"alpha_min": min(alpha), "alpha_max": max(alpha), "alpha_distinct_values": len(set(alpha))}


def psnr_db(reference: bytes, candidate: bytes) -> float:
    squared_error = sum((a - b) ** 2 for a, b in zip(reference, candidate))
    if squared_error == 0:
        return math.inf
    mean_squared_error = squared_error / len(reference)
    return 10 * math.log10(255 * 255 / mean_squared_error)


def sha256_file(path: str) -> str:
    with open(path, "rb") as handle:
        return hashlib.sha256(handle.read()).hexdigest()


def main() -> None:
    output_dir = sys.argv[1]
    source_png = os.path.join(output_dir, "source.png")
    lossless_png = os.path.join(output_dir, "lossless-decoded.png")
    lossy_png = os.path.join(output_dir, "lossy-decoded.png")

    checks: dict[str, bool] = {}
    for label, path in (("source", source_png), ("lossless", lossless_png), ("lossy", lossy_png)):
        checks[f"{label}_dimensions_64x64"] = dimensions(path) == (EXPECTED_WIDTH, EXPECTED_HEIGHT)

    source = rgba_bytes(source_png)
    lossless = rgba_bytes(lossless_png)
    lossy = rgba_bytes(lossy_png)

    lossless_summary = alpha_summary(lossless)
    lossy_summary = alpha_summary(lossy)
    for label, summary in (("lossless", lossless_summary), ("lossy", lossy_summary)):
        checks[f"{label}_alpha_range_0_to_255"] = summary["alpha_min"] == 0 and summary["alpha_max"] == 255
        checks[f"{label}_alpha_has_ramp"] = summary["alpha_distinct_values"] > 2

    lossless_identical = hashlib.sha256(lossless).hexdigest() == hashlib.sha256(source).hexdigest()
    checks["lossless_pixel_identical"] = lossless_identical

    lossy_psnr = psnr_db(source, lossy)
    checks["lossy_psnr_at_least_floor"] = lossy_psnr >= PSNR_FLOOR_DB

    metrics = {
        "avifenc_version": run_text(["avifenc", "--version"]),
        "avifdec_version": run_text(["avifdec", "--version"]),
        "imagemagick_version": run_text(["magick", "-version"]),
        "python_version": sys.version.split()[0],
        "source_dimensions": list(dimensions(source_png)),
        "lossless_dimensions": list(dimensions(lossless_png)),
        "lossy_dimensions": list(dimensions(lossy_png)),
        "source_rgba_sha256": hashlib.sha256(source).hexdigest(),
        "lossless_rgba_sha256": hashlib.sha256(lossless).hexdigest(),
        "lossless_pixel_identical": lossless_identical,
        "lossless_alpha": lossless_summary,
        "lossy_alpha": lossy_summary,
        "lossy_psnr_db_rgba": round(lossy_psnr, 4),
        "psnr_floor_db": PSNR_FLOOR_DB,
        "lossless_avif_sha256": sha256_file(os.path.join(output_dir, "lossless.avif")),
        "lossy_avif_sha256": sha256_file(os.path.join(output_dir, "lossy.avif")),
        "lossless_avif_bytes": os.path.getsize(os.path.join(output_dir, "lossless.avif")),
        "lossy_avif_bytes": os.path.getsize(os.path.join(output_dir, "lossy.avif")),
        "checks": checks,
    }
    with open(os.path.join(output_dir, "metrics.json"), "w", encoding="utf-8") as handle:
        json.dump(metrics, handle, indent=2, sort_keys=True)
        handle.write("\n")

    failed = [name for name, passed in checks.items() if not passed]
    if failed:
        print(f"predeclared checks failed: {', '.join(failed)}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
