"""Measure a rembg cutout against the scene's analytic ground truth and print checks as JSON."""
import hashlib
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image

ALPHA_OPAQUE_MIN = 128
SUBJECT_OPAQUE_FRACTION_MIN = 0.90
BACKGROUND_TRANSPARENT_FRACTION_MIN = 0.90
IOU_FLOOR = 0.90
RERUN_MAX_CHANNEL_DIFFERENCE = 2
DECIMALS = 6


def sha256_of_file(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load_png_info(path: Path) -> tuple[str, str, tuple[int, int]]:
    with Image.open(path) as image:
        return image.format or "", image.mode, image.size


def load_rgba(path: Path) -> np.ndarray:
    with Image.open(path) as image:
        return np.asarray(image.convert("RGBA"))


def build_region_masks(geometry: dict[str, float]) -> dict[str, np.ndarray]:
    size = int(geometry["size_px"])
    ys, xs = np.mgrid[0:size, 0:size].astype(float)
    distance = np.hypot(xs + 0.5 - geometry["centre_px"], ys + 0.5 - geometry["centre_px"])
    return {
        "subject": distance <= geometry["subject_region_outer_px"],
        "background": distance >= geometry["background_region_inner_px"],
        "ground_truth": distance <= geometry["sphere_radius_px"],
    }


def main(argv: list[str]) -> int:
    if len(argv) != 5:
        print("usage: check.py INPUT_PNG SCENE_JSON CUTOUT_PNG RERUN_PNG", file=sys.stderr)
        return 2
    input_path, scene_json, cutout_path, rerun_path = (Path(item) for item in argv[1:])
    geometry = json.loads(scene_json.read_text())
    input_format, input_mode, input_size = load_png_info(input_path)
    cutout_format, cutout_mode, cutout_size = load_png_info(cutout_path)
    expected_size = (int(geometry["size_px"]), int(geometry["size_px"]))

    rgba = load_rgba(cutout_path)
    rerun_rgba = load_rgba(rerun_path)
    opaque = rgba[..., 3] >= ALPHA_OPAQUE_MIN
    masks = build_region_masks(geometry)

    subject_opaque_fraction = float(opaque[masks["subject"]].mean())
    background_transparent_fraction = float((~opaque)[masks["background"]].mean())
    intersection = int(np.logical_and(opaque, masks["ground_truth"]).sum())
    union = int(np.logical_or(opaque, masks["ground_truth"]).sum())
    iou = intersection / union
    cutout_hash = sha256_of_file(cutout_path)
    rerun_hash = sha256_of_file(rerun_path)
    max_channel_difference = int(np.abs(rgba.astype(int) - rerun_rgba.astype(int)).max())

    checks = {
        "output_is_rgba_png": cutout_format == "PNG" and cutout_mode == "RGBA",
        "same_size_as_input": cutout_size == input_size == expected_size,
        "subject_region_mostly_opaque": subject_opaque_fraction >= SUBJECT_OPAQUE_FRACTION_MIN,
        "background_region_mostly_transparent": background_transparent_fraction
        >= BACKGROUND_TRANSPARENT_FRACTION_MIN,
        "iou_at_or_above_floor": iou >= IOU_FLOOR,
        "rerun_identical_or_within_tolerance": cutout_hash == rerun_hash
        or max_channel_difference <= RERUN_MAX_CHANNEL_DIFFERENCE,
        "cutout_hash_differs_from_input": cutout_hash != sha256_of_file(input_path),
    }
    measurements = {
        "input_format": input_format,
        "input_mode": input_mode,
        "cutout_size": list(cutout_size),
        "subject_opaque_fraction": round(subject_opaque_fraction, DECIMALS),
        "background_transparent_fraction": round(background_transparent_fraction, DECIMALS),
        "iou": round(iou, DECIMALS),
        "ground_truth_pixels": int(masks["ground_truth"].sum()),
        "opaque_pixels": int(opaque.sum()),
        "rerun_byte_identical": cutout_hash == rerun_hash,
        "rerun_max_channel_difference": max_channel_difference,
        "input_sha256": sha256_of_file(input_path),
        "cutout_sha256": cutout_hash,
        "rerun_sha256": rerun_hash,
    }
    tolerances = {
        "alpha_opaque_min": ALPHA_OPAQUE_MIN,
        "subject_opaque_fraction_min": SUBJECT_OPAQUE_FRACTION_MIN,
        "background_transparent_fraction_min": BACKGROUND_TRANSPARENT_FRACTION_MIN,
        "iou_floor": IOU_FLOOR,
        "rerun_max_channel_difference": RERUN_MAX_CHANNEL_DIFFERENCE,
    }
    report = {"checks": checks, "measurements": measurements, "tolerances": tolerances}
    print(json.dumps(report, indent=2, sort_keys=True))
    return 0 if all(checks.values()) else 1


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
