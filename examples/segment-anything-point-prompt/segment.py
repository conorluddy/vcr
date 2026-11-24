"""Segment each object of the scene with SAM ViT-B on CPU: one positive point, then one box, per object.

Usage: segment.py <scene.png> <scene.json> <out-dir>
Writes <out-dir>/{disc,square}-{point,box}.png (8-bit binary masks, 0 or 255), <out-dir>/disc-cutout.png
(RGBA, alpha = the disc point mask) and <out-dir>/scores.json (SAM's three candidate IoU scores and the index kept).
"""
import json
import sys
from pathlib import Path

import numpy as np
import torch
from PIL import Image
from transformers import SamModel, SamProcessor

MODEL_ID = "facebook/sam-vit-base"
MODEL_REVISION = "70c1a07f894ebb5b307fd9eaaee97b9dfc16068f"
POSITIVE_LABEL = 1


def write_binary_mask_png(mask: np.ndarray, mask_path: Path) -> None:
    Image.fromarray((mask.astype(np.uint8) * 255), mode="L").save(mask_path)


def segment_with_prompt(
    processor: SamProcessor,
    model: SamModel,
    image: Image.Image,
    point_xy: list[float] | None,
    box_xyxy: list[float] | None,
) -> tuple[np.ndarray, list[float], int]:
    if point_xy is not None:
        inputs = processor(image, input_points=[[point_xy]], input_labels=[[POSITIVE_LABEL]], return_tensors="pt")
    else:
        inputs = processor(image, input_boxes=[[box_xyxy]], return_tensors="pt")
    with torch.no_grad():
        outputs = model(**inputs)
    masks = processor.image_processor.post_process_masks(
        outputs.pred_masks, inputs["original_sizes"], inputs["reshaped_input_sizes"]
    )
    candidate_scores = outputs.iou_scores[0, 0].tolist()
    selected_index = int(np.argmax(candidate_scores))
    selected_mask = masks[0][0, selected_index].numpy().astype(bool)
    return selected_mask, candidate_scores, selected_index


def main(argv: list[str]) -> int:
    if len(argv) != 4:
        print("usage: segment.py SCENE_PNG SCENE_JSON OUT_DIR", file=sys.stderr)
        return 2
    scene_png, scene_json, out_dir = Path(argv[1]), Path(argv[2]), Path(argv[3])
    geometry = json.loads(scene_json.read_text())
    out_dir.mkdir(parents=True, exist_ok=True)
    image = Image.open(scene_png).convert("RGB")
    processor = SamProcessor.from_pretrained(MODEL_ID, revision=MODEL_REVISION)
    model = SamModel.from_pretrained(MODEL_ID, revision=MODEL_REVISION).to("cpu").eval()

    prompts = {
        "disc-point": (geometry["disc"]["point_prompt_px"], None),
        "disc-box": (None, geometry["disc"]["box_prompt_xyxy"]),
        "square-point": (geometry["square"]["point_prompt_px"], None),
        "square-box": (None, geometry["square"]["box_prompt_xyxy"]),
    }
    scores_report: dict[str, dict[str, object]] = {}
    for name, (point_xy, box_xyxy) in prompts.items():
        mask, candidate_scores, selected_index = segment_with_prompt(processor, model, image, point_xy, box_xyxy)
        write_binary_mask_png(mask, out_dir / f"{name}.png")
        scores_report[name] = {"iou_scores": candidate_scores, "selected_index": selected_index}
        if name == "disc-point":
            rgb = np.asarray(image.convert("RGB"))
            alpha = mask.astype(np.uint8) * 255
            Image.fromarray(np.dstack([rgb, alpha]), mode="RGBA").save(out_dir / "disc-cutout.png")

    (out_dir / "scores.json").write_text(json.dumps(scores_report, indent=2, sort_keys=True) + "\n")
    print(f"model={MODEL_ID} revision={MODEL_REVISION} wrote {sorted(prompts)} to {out_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
