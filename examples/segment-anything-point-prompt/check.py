"""Measure SAM masks against the scene's analytic ground truth and print the predeclared checks as JSON."""
import hashlib
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image

IOU_FLOOR = 0.90
LEAK_MAX_FRACTION = 0.01
OPAQUE_FRACTION_MIN = 0.05
OPAQUE_FRACTION_MAX = 0.10
RERUN_MAX_DISAGREEMENT_FRACTION = 0.001
DECIMALS = 6
MASK_NAMES = ("disc-point", "disc-box", "square-point", "square-box")
EXPECTED_RUN_FILES = {*(f"{name}.png" for name in MASK_NAMES), "disc-cutout.png", "scores.json"}
OTHER_OBJECT = {"disc": "square", "square": "disc"}


def sha256_of_file(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load_mask(path: Path) -> np.ndarray:
    with Image.open(path) as image:
        return np.asarray(image.convert("L"))


def build_ground_truth(geometry: dict[str, object], size_px: int) -> dict[str, np.ndarray]:
    ys, xs = np.mgrid[0:size_px, 0:size_px].astype(float)
    pixel_x = xs + 0.5
    pixel_y = ys + 0.5
    disc = geometry["disc"]
    square = geometry["square"]
    centre_x, centre_y = disc["centre_px"]
    bounds = square["bounds_px"]
    return {
        "disc": np.hypot(pixel_x - centre_x, pixel_y - centre_y) <= disc["radius_px"],
        "square": (
            (pixel_x >= bounds["x0"])
            & (pixel_x <= bounds["x1"])
            & (pixel_y >= bounds["y0"])
            & (pixel_y <= bounds["y1"])
        ),
    }


def intersection_over_union(mask: np.ndarray, truth: np.ndarray) -> float:
    return float(np.logical_and(mask, truth).sum() / np.logical_or(mask, truth).sum())


def main(argv: list[str]) -> int:
    if len(argv) != 5:
        print("usage: check.py SCENE_PNG SCENE_JSON RUN1_DIR RUN2_DIR", file=sys.stderr)
        return 2
    scene_png, scene_json, run_one, run_two = (Path(item) for item in argv[1:])
    geometry = json.loads(scene_json.read_text())
    size_px = int(geometry["size_px"])
    with Image.open(scene_png) as scene_image:
        scene_format, scene_mode, scene_size = scene_image.format or "", scene_image.mode, scene_image.size
    truths = build_ground_truth(geometry, size_px)

    masks_one = {name: load_mask(run_one / f"{name}.png") for name in MASK_NAMES}
    masks_two = {name: load_mask(run_two / f"{name}.png") for name in MASK_NAMES}
    object_of = {name: name.split("-")[0] for name in MASK_NAMES}
    prompt_of = {name: name.split("-")[1] for name in MASK_NAMES}

    iou = {
        name: intersection_over_union(masks_one[name] > 0, truths[object_of[name]]) for name in MASK_NAMES
    }
    leak = {
        name: float((masks_one[name] > 0)[truths[OTHER_OBJECT[object_of[name]]]].sum() / max((masks_one[name] > 0).sum(), 1))
        for name in MASK_NAMES
    }
    disagreement = {
        name: float((masks_one[name] != masks_two[name]).mean()) for name in MASK_NAMES
    }
    mask_identical = {
        name: sha256_of_file(run_one / f"{name}.png") == sha256_of_file(run_two / f"{name}.png") for name in MASK_NAMES
    }
    cutout_alpha = np.asarray(Image.open(run_one / "disc-cutout.png").convert("RGBA"))[..., 3]
    opaque_fraction = float((cutout_alpha == 255).mean())
    hashes = {
        "input": sha256_of_file(scene_png),
        **{name: sha256_of_file(run_one / f"{name}.png") for name in MASK_NAMES},
        "disc-cutout": sha256_of_file(run_one / "disc-cutout.png"),
    }
    binary_values = {
        int(value) for masks in (masks_one, masks_two) for mask in masks.values() for value in np.unique(mask)
    }
    shapes_ok = all(
        mask.shape == (size_px, size_px) and Image.open(run_one / f"{name}.png").mode == "L"
        for name, mask in masks_one.items()
    )
    checks = {
        "input_is_rgb_png_512": scene_format == "PNG" and scene_mode == "RGB" and scene_size == (size_px, size_px),
        "mask_shape_matches_input": shapes_ok,
        "masks_are_binary_0_or_255": binary_values <= {0, 255},
        "point_prompt_iou_at_or_above_floor": all(
            iou[name] >= IOU_FLOOR for name in MASK_NAMES if prompt_of[name] == "point"
        ),
        "box_prompt_iou_at_or_above_floor": all(
            iou[name] >= IOU_FLOOR for name in MASK_NAMES if prompt_of[name] == "box"
        ),
        "mask_excludes_other_object": all(value <= LEAK_MAX_FRACTION for value in leak.values()),
        "disc_cutout_alpha_range": int(cutout_alpha.min()) == 0
        and int(cutout_alpha.max()) == 255
        and OPAQUE_FRACTION_MIN <= opaque_fraction <= OPAQUE_FRACTION_MAX,
        "rerun_identical_or_within_tolerance": all(
            value <= RERUN_MAX_DISAGREEMENT_FRACTION for value in disagreement.values()
        ),
        "at_least_two_distinct_hashes": len(set(hashes.values())) >= 2,
        "one_still_set_per_run": {path.name for path in run_one.iterdir()} == EXPECTED_RUN_FILES
        and {path.name for path in run_two.iterdir()} == EXPECTED_RUN_FILES,
    }
    scores = json.loads((run_one / "scores.json").read_text())
    measurements = {
        "input_format": scene_format,
        "input_mode": scene_mode,
        "iou": {name: round(iou[name], DECIMALS) for name in MASK_NAMES},
        "leak_fraction": {name: round(leak[name], DECIMALS) for name in MASK_NAMES},
        "ground_truth_pixels": {name: int(truths[name].sum()) for name in truths},
        "mask_pixels": {name: int((masks_one[name] > 0).sum()) for name in MASK_NAMES},
        "sam_candidate_iou_scores": {name: [round(value, DECIMALS) for value in scores[name]["iou_scores"]] for name in MASK_NAMES},
        "sam_selected_index": {name: scores[name]["selected_index"] for name in MASK_NAMES},
        "cutout_alpha_min": int(cutout_alpha.min()),
        "cutout_alpha_max": int(cutout_alpha.max()),
        "cutout_opaque_fraction": round(opaque_fraction, DECIMALS),
        "rerun_disagreement_fraction": {name: round(disagreement[name], DECIMALS) for name in MASK_NAMES},
        "rerun_byte_identical": mask_identical,
        "hashes": hashes,
    }
    tolerances = {
        "iou_floor": IOU_FLOOR,
        "leak_max_fraction": LEAK_MAX_FRACTION,
        "opaque_fraction_range": [OPAQUE_FRACTION_MIN, OPAQUE_FRACTION_MAX],
        "rerun_max_disagreement_fraction": RERUN_MAX_DISAGREEMENT_FRACTION,
    }
    report = {"checks": checks, "measurements": measurements, "tolerances": tolerances}
    print(json.dumps(report, indent=2, sort_keys=True))
    return 0 if all(checks.values()) else 1


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
