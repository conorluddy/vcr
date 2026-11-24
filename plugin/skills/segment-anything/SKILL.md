---
name: segment-anything
description: Get a binary mask for a chosen object in a still image from one point or one box with Segment Anything (SAM ViT-B) through transformers on CPU. VCR evidence covers one synthetic still with two hard-edged shapes; not photos, hair, everything mode or GPU.
---

# Segment Anything (SAM ViT-B)

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`. Run it from the workspace (the directory holding `vcr.json`).

## Use cases and limits
- SAM is promptable: you point at, or box, the object you want and it returns a mask for that object. In VCR that gives a matte for one chosen subject, which can become an alpha cutout.
- Evidence: `facebook/sam-vit-base` at revision `70c1a07f894ebb5b307fd9eaaee97b9dfc16068f` (Apache-2.0), transformers 5.24.0 `SamModel`/`SamProcessor`, torch 2.15.0 CPU, Python 3.12.13, macOS arm64. One generated 512×512 still with a shaded disc and a flat square over a striped background. One positive point or one box per object gave binary masks at the input size: IoU 0.994778 (disc, point), 0.992292 (disc, box), 0.999784 (square, point), 0.999622 (square, box) against the analytic shapes, no pixels on the other object, and a fresh-process rerun was byte-identical.
- The high IoU reflects hard-edged synthetic shapes with strong contrast. It is not a quality bar for photographs. The example's floors are fixture parameters.
- Untested: automatic mask generation (everything mode), multi-point and negative prompts, mask-input refinement, the other two multimask candidates, ViT-L/ViT-H, SAM 2, video, MPS or GPU, photographs, hair and soft edges, the upstream `segment_anything` package. Byte identity was seen on one machine and torch build only.
- Neighbours: [rembg](../rembg/SKILL.md) finds the salient object automatically and returns a cutout with no prompt; SAM is for when you choose which object. [mediapipe](../mediapipe/SKILL.md) for a category mask from a task model (people) without prompts. `imagemagick` for compositing the result.
- Image treatment: a mask edge is a treatment decision. The fixture's masks are hard and binary and exercise no feathering; judge any real matte on a contrasting backdrop (`FX-MASK-EDGE`; `vcr rules info FX-MASK-EDGE`).

## Capability map
Discovery only; nothing here is validated unless marked tested.
- **transformers SAM:** [model docs](https://huggingface.co/docs/transformers/model_doc/sam). `SamProcessor` takes `input_points` and `input_labels` (1 positive), or `input_boxes` (xyxy pixels); `SamModel` returns `pred_masks` (three candidates) and `iou_scores`. Tested: one positive point, one box.
- **Post-processing:** `image_processor.post_process_masks` rescales to the original size. Tested.
- **Prompt variants:** several points, negative labels (0), previous-mask input. Untested.
- **Other checkpoints:** ViT-L, ViT-H on the Hub. Untested; check each licence.
- **Upstream package and automatic mask generator:** [segment-anything](https://github.com/facebookresearch/segment-anything). Untested.

## Install and doctor
A project Python venv, not a machine executable (about 1 GB):
```sh
/opt/homebrew/bin/python3.12 -m venv examples/segment-anything-point-prompt/output/venv   # Homebrew python3.12
examples/segment-anything-point-prompt/output/venv/bin/pip install -r examples/segment-anything-point-prompt/requirements.txt
```
Pins: torch 2.15.0, transformers 5.24.0, numpy 2.5.5, pillow 13.0.0. `vcr doctor` does not prove the venv imports; check with `output/venv/bin/python -c "import torch, transformers"`. `run.sh` refuses to run without the venv and never installs.

- `run.sh` sets `HF_HOME` and `TORCH_HOME` to `output/cache`; the first run downloads `model.safetensors` (374,979,480 bytes, about 358 MiB) there. Needs network once; weights are not committed.
- Licences: the checkpoint's model card says apache-2.0 (checked 2026-11-24); other checkpoints were not checked.

## Smoke test
```sh
cd examples/segment-anything-point-prompt && ./run.sh
# expect: segment-anything-point-prompt: OK  (output/checks.json matches expected/checks.json: four masks, IoU 0.992292 to 0.999784, leak 0.0, rerun byte-identical)
```
`generate.py` draws the scene, `segment.py` segments twice in separate processes, `check.py` measures against the analytic shapes.

## Recipe
```python
processor = SamProcessor.from_pretrained(MODEL_ID, revision=REVISION)
model = SamModel.from_pretrained(MODEL_ID, revision=REVISION).to("cpu").eval()
inputs = processor(image, input_points=[[[160, 176]]], input_labels=[[1]], return_tensors="pt")  # or input_boxes=[[[x0, y0, x1, y1]]]
with torch.no_grad():
    outputs = model(**inputs)
masks = processor.image_processor.post_process_masks(outputs.pred_masks, inputs["original_sizes"], inputs["reshaped_input_sizes"])
best = int(outputs.iou_scores[0, 0].argmax())   # the fixture keeps the highest-scored candidate
mask = masks[0][0, best].numpy()
```
Check the exact prompt nesting in `segment.py` (`input_points=[[point]]` with `input_labels=[[1]]`, `input_boxes=[[box]]`); it is the version that ran. Create processor and model once per process. The predicted IoU scores exceeded 1 in the fixture, so they rank candidates but are not a quality measure. Inspect the mask over the image before using it.

## Troubleshooting
- Wrong prompt nesting: the first draft used one bracket level too many and was corrected before any run; follow `segment.py`.
- A long first run is the checkpoint download; later runs read `output/cache`.
- Expected files differ after a revision, transformers or torch change: re-record only after review.

## Official docs
- [transformers SAM](https://huggingface.co/docs/transformers/model_doc/sam)
- [facebook/sam-vit-base model card](https://huggingface.co/facebook/sam-vit-base)
- [segment-anything repository](https://github.com/facebookresearch/segment-anything)
