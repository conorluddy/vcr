#!/usr/bin/env python3
"""Check nerfstudio outputs against predeclared thresholds and measured counts.

Usage:
  verify.py process <data-dir> <expected-dir>
  verify.py all <data-dir> <train-dir> <eval-dir> <expected-dir> <train-seconds> [--record]
"""
import json
from pathlib import Path
import sys

import numpy as np
from PIL import Image
import yaml


def fail(message: str) -> None:
    raise SystemExit(f"FAIL: {message}")


def read_predeclared(expected_dir: Path) -> dict[str, object]:
    return json.loads((expected_dir / "predeclared.json").read_text())


def check_registered_frames(data_dir: Path, predeclared: dict[str, object]) -> int:
    transforms = json.loads((data_dir / "transforms.json").read_text())
    frames = transforms["frames"]
    for frame in frames:
        matrix = np.asarray(frame["transform_matrix"], dtype=float)
        if matrix.shape != (4, 4) or not np.isfinite(matrix).all():
            fail(f"invalid transform_matrix for {frame['file_path']}")
        if not (data_dir / frame["file_path"]).exists():
            fail(f"transforms.json frame file missing on disk: {frame['file_path']}")
    if len(frames) != predeclared["frame_count"]:
        fail(f"registered frames {len(frames)}, predeclared {predeclared['frame_count']}")
    return len(frames)


def read_final_checkpoint_step(train_dir: Path) -> int:
    steps = sorted(int(path.stem.split("-")[1]) for path in train_dir.rglob("step-*.ckpt"))
    if not steps:
        fail(f"no checkpoint written under {train_dir}")
    return steps[-1]


def read_device_type(train_dir: Path) -> str:
    config_path = next(train_dir.rglob("config.yml"), None)
    if config_path is None:
        fail(f"no config.yml under {train_dir}")
    config = yaml.safe_load(config_path.read_text())
    return config["machine"]["device_type"]


def read_eval_image_summary(eval_dir: Path) -> dict[str, object]:
    images = sorted(eval_dir.rglob("*.png"))
    if not images:
        fail(f"no eval PNG written under {eval_dir}")
    pixels = np.asarray(Image.open(images[0]).convert("RGB"), dtype=float)
    height, width = pixels.shape[:2]
    return {
        "eval_image_count": len(images),
        "eval_image": images[0].name,
        "width": width,
        "height": height,
        "std": round(float(pixels.std()), 2),
        "unique_colours": int(len(np.unique(pixels.reshape(-1, 3), axis=0))),
    }


def verify_process_stage(argv: list[str]) -> None:
    data_dir, expected_dir = Path(argv[0]), Path(argv[1])
    frame_count = check_registered_frames(data_dir, read_predeclared(expected_dir))
    print(json.dumps({"stage": "process", "registered_frames": frame_count}, indent=2))


def verify_all_stages(argv: list[str]) -> None:
    data_dir, train_dir, eval_dir, expected_dir = (Path(arg) for arg in argv[:4])
    train_seconds = float(argv[4])
    record = "--record" in argv[5:]
    predeclared = read_predeclared(expected_dir)

    frame_count = check_registered_frames(data_dir, predeclared)
    final_step = read_final_checkpoint_step(train_dir)
    device_type = read_device_type(train_dir)
    eval_summary = read_eval_image_summary(eval_dir)
    measured = {
        "frame_count": frame_count,
        "final_step": final_step,
        "device_type": device_type,
        "eval_image_count": eval_summary["eval_image_count"],
        "eval_width": eval_summary["width"],
        "eval_height": eval_summary["height"],
    }

    if final_step != predeclared["final_step"]:
        fail(f"final checkpoint step {final_step}, predeclared {predeclared['final_step']}")
    if device_type != predeclared["device_type"]:
        fail(f"training device {device_type}, predeclared {predeclared['device_type']}")
    if [eval_summary["width"], eval_summary["height"]] != predeclared["image_size"]:
        fail(f"eval image size {eval_summary['width']}x{eval_summary['height']}, predeclared {predeclared['image_size']}")
    if eval_summary["eval_image_count"] < predeclared["min_eval_images"]:
        fail("no eval image")
    if eval_summary["std"] <= predeclared["min_eval_std"] or eval_summary["unique_colours"] < 2:
        fail(f"eval image looks blank: std={eval_summary['std']} unique_colours={eval_summary['unique_colours']}")
    if train_seconds > predeclared["train_seconds_cap"]:
        fail(f"training took {train_seconds:.0f}s, cap {predeclared['train_seconds_cap']}s")

    measured_path = expected_dir / "measured.json"
    if record:
        measured_path.write_text(json.dumps(measured, indent=2) + "\n")
    elif json.loads(measured_path.read_text()) != measured:
        fail(f"measured {measured} differs from {measured_path}")

    print(json.dumps({"measured": measured, "eval": eval_summary, "train_seconds": round(train_seconds, 1)}, indent=2))


def main() -> None:
    if len(sys.argv) < 2:
        raise SystemExit("usage: verify.py process|all ...")
    stage, arguments = sys.argv[1], sys.argv[2:]
    if stage == "process":
        verify_process_stage(arguments)
    elif stage == "all":
        verify_all_stages(arguments)
    else:
        raise SystemExit(f"unknown stage {stage!r}; use process or all")


if __name__ == "__main__":
    main()
