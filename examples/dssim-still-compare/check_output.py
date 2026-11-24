#!/usr/bin/env python3
"""Checks dssim scores and difference maps against the predeclared checks and writes metrics.json."""
import filecmp
import hashlib
import json
import os
import re
import struct
import subprocess
import sys

EXPECTED_DSSIM_VERSION = "3.4.0"
QUALITIES = (90, 50, 10)
SIZE = 256


def fail(message: str) -> None:
    raise SystemExit(f"dssim-still-compare: FAILED: {message}")


def sha256_of_file(path: str) -> str:
    with open(path, "rb") as handle:
        return hashlib.sha256(handle.read()).hexdigest()


def png_header(path: str) -> tuple:
    with open(path, "rb") as handle:
        data = handle.read(33)
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        fail(f"{path} is not a PNG")
    width, height, bit_depth, colour_type = struct.unpack(">IIBB", data[16:26])
    return width, height, bit_depth, colour_type


def read_scores(path: str, expected_count: int) -> list:
    with open(path, encoding="utf-8") as handle:
        lines = [line for line in handle.read().splitlines() if line.strip()]
    if len(lines) != expected_count:
        fail(f"{path} has {len(lines)} score lines, expected {expected_count}")
    scores = []
    for line in lines:
        token = line.split()[0]
        if not re.fullmatch(r"\d+(\.\d+)?([eE][-+]?\d+)?", token):
            fail(f"{path}: cannot parse score from line '{line}'")
        scores.append(token)
    return scores


def image_statistics(path: str) -> dict:
    result = subprocess.run(
        ["magick", path, "-format", "%w %h %[fx:mean] %[fx:maxima]", "info:"],
        capture_output=True,
        check=True,
        text=True,
    )
    width, height, mean, maxima = result.stdout.split()
    return {"width": int(width), "height": int(height), "mean": float(mean), "maxima": float(maxima)}


def dssim_version(help_path: str) -> str:
    with open(help_path, encoding="utf-8") as handle:
        match = re.search(r"Version (\S+)", handle.read())
    if match is None:
        fail(f"no 'Version' line in {help_path}")
    return match.group(1)


def check_run(run_dir: str, run_label: str) -> dict:
    self_scores = read_scores(os.path.join(run_dir, "self.txt"), 1)
    if float(self_scores[0]) != 0.0:
        fail(f"{run_label}: self-score is {self_scores[0]}, expected exactly 0")

    sequential = read_scores(os.path.join(run_dir, "sequential.txt"), len(QUALITIES))
    reversed_scores = read_scores(os.path.join(run_dir, "reversed.txt"), len(QUALITIES))
    sequential_by_quality = dict(zip(QUALITIES, sequential))
    reversed_by_quality = dict(zip(reversed(QUALITIES), reversed_scores))
    if sequential_by_quality != reversed_by_quality:
        fail(f"{run_label}: reversed-order scores {reversed_by_quality} differ from sequential {sequential_by_quality}")

    values = [float(sequential_by_quality[quality]) for quality in QUALITIES]
    if not (0.0 < values[0] < values[1] < values[2]):
        fail(f"{run_label}: scores q90 < q50 < q10 not strictly increasing above 0: {sequential_by_quality}")

    maps = {}
    for quality in QUALITIES:
        map_directory = os.path.join(run_dir, "maps")
        scale_files = [name for name in os.listdir(map_directory) if name.startswith(f"q{quality}.png-")]
        if len(scale_files) != 5:
            fail(f"{run_label}: q{quality} wrote {len(scale_files)} scale maps, expected 5")
        map_path = os.path.join(map_directory, f"q{quality}.png-0.png")
        stats = image_statistics(map_path)
        if (stats["width"], stats["height"]) != (SIZE, SIZE):
            fail(f"{run_label}: map q{quality} is {stats['width']}x{stats['height']}, expected {SIZE}x{SIZE}")
        if stats["maxima"] <= 0.0 or stats["mean"] <= 0.0:
            fail(f"{run_label}: map q{quality} is blank (mean {stats['mean']}, max {stats['maxima']})")
        maps[quality] = {"path": map_path, "sha256": sha256_of_file(map_path), **stats}

    if not (maps[90]["mean"] < maps[50]["mean"] < maps[10]["mean"]):
        fail(f"{run_label}: map means do not grow with degradation")

    return {
        "self_score": self_scores[0],
        "sequential_scores": {f"q{quality}": sequential_by_quality[quality] for quality in QUALITIES},
        "reversed_scores": {f"q{quality}": reversed_by_quality[quality] for quality in QUALITIES},
        "maps": {
            f"q{quality}": {
                "sha256": maps[quality]["sha256"],
                "mean": maps[quality]["mean"],
                "maxima": maps[quality]["maxima"],
            }
            for quality in QUALITIES
        },
    }


def main() -> None:
    base_path, degraded_dir, scores_dir, repeat_dir, help_path, versions_path, metrics_path = sys.argv[1:]

    version = dssim_version(help_path)
    if version != EXPECTED_DSSIM_VERSION:
        fail(f"expected dssim {EXPECTED_DSSIM_VERSION}, got {version}")

    width, height, bit_depth, colour_type = png_header(base_path)
    if (width, height, bit_depth, colour_type) != (SIZE, SIZE, 8, 2):
        fail(f"base.png is {width}x{height} depth {bit_depth} colour type {colour_type}, expected {SIZE}x{SIZE} 8-bit RGB")

    png_inputs = {"base": base_path}
    for quality in QUALITIES:
        degraded_path = os.path.join(degraded_dir, f"q{quality}.png")
        dimensions = png_header(degraded_path)[:2]
        if dimensions != (SIZE, SIZE):
            fail(f"q{quality}.png is {dimensions}, expected {SIZE}x{SIZE}")
        png_inputs[f"q{quality}"] = degraded_path
    input_hashes = {name: sha256_of_file(path) for name, path in png_inputs.items()}
    if len(set(input_hashes.values())) < 2:
        fail("fewer than two distinct input hashes")

    first_run = check_run(scores_dir, "first run")
    second_run = check_run(repeat_dir, "repeat run")
    if first_run != second_run:
        fail("repeat run's scores or map statistics differ from the first run")

    for name in ("self.txt", "sequential.txt", "reversed.txt"):
        if not filecmp.cmp(os.path.join(scores_dir, name), os.path.join(repeat_dir, name), shallow=False):
            fail(f"repeat run's {name} is not byte-identical")
    for quality in QUALITIES:
        for scale in range(5):
            name = f"maps/q{quality}.png-{scale}.png"
            if not filecmp.cmp(os.path.join(scores_dir, name), os.path.join(repeat_dir, name), shallow=False):
                fail(f"repeat run's {name} is not byte-identical")

    with open(versions_path, encoding="utf-8") as handle:
        magick_version = handle.readline().strip()

    metrics = {
        "dssim_version": version,
        "magick_version": magick_version,
        "frame_count": len(png_inputs),
        "map_count_per_run": len(QUALITIES),
        "dimensions": f"{SIZE}x{SIZE}",
        "distinct_input_hashes": len(set(input_hashes.values())),
        "input_sha256": input_hashes,
        "run": first_run,
        "repeat_identical": True,
    }
    with open(metrics_path, "w", encoding="utf-8") as handle:
        json.dump(metrics, handle, indent=2, sort_keys=True)
        handle.write("\n")


if __name__ == "__main__":
    main()
