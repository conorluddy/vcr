---
name: depth-anything-v2
description: Estimate a relative depth map from one still image with Depth Anything V2 Small through the transformers depth-estimation pipeline. VCR evidence covers one generated receding-floor scene on CPU; check the licence before using any larger checkpoint.
---

# Depth Anything V2

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`. Run it from the workspace (the directory holding `vcr.json`).

## Use cases and limits
- Depth Anything V2 is a monocular depth model: one RGB image in, one per-pixel depth map out. In VCR it supplies the map for a 2.5D move (layer slicing, parallax, depth haze or blur) built elsewhere.
- Licence first: only the **Small** checkpoint is Apache-2.0. Base, Large and Giant weights are CC-BY-NC-4.0. Use Small unless non-commercial use is certain.
- Evidence: checkpoint `depth-anything/Depth-Anything-V2-Small-hf` at Hub commit `5426e4f0f36572d16453bbda7a8389317b1bef99`, transformers 5.24.0, torch 2.15.0, CPU, macOS arm64, one generated 640x480 receding checkerboard floor with a near and a far disc. Output was a 480x640 float32 map. Near disc median 9.1815 against far disc 0.9429 (larger = nearer). The floor was monotone toward the bottom on 260 of 260 adjacent row pairs. A fresh-process rerun was byte-identical.
- The map is **relative** (inverse-depth-like), not metric: no scale, units or calibration. Values are only comparable within one image.
- Seen weakness: the far disc is barely separated from the floor behind it (a faint lighter spot). The ordering check passed because the near disc is far brighter than everything else, not because the model isolated the far object. Do not trust small distant objects to get their own depth.
- Untested: photographs, metric-depth variants, video and temporal consistency (use a video-depth model; per-frame output was not checked for flicker), MPS or GPU, Base/Large/Giant, the upstream repository scripts and any 2.5D render built from the map. The example's thresholds are fixture parameters, not a quality bar.
- Byte identity was seen on one machine and one torch build only.
- Image treatment and motion: a depth-sliced layer needs a clean mask edge (`FX-MASK-EDGE`; `vcr rules info <ID>`). Parallax and depth cues belong to the motion pillar (`references/motion-director/`, "Moves" and "Depth cues"); parallax is a common vestibular trigger, so see the accessibility pillar before shipping large moves. Depth haze is covered in the lighting pillar's fog/haze entry.

## Capability map
Discovery only; the [repository README](https://github.com/DepthAnything/Depth-Anything-V2#readme) is the entry point. This is not VCR validation.
- **transformers pipeline:** `pipeline("depth-estimation", model=..., device="cpu")`, documented in the [depth estimation task guide](https://huggingface.co/docs/transformers/tasks/monocular_depth_estimation). Tested: Small-hf, `predicted_depth` read back at input size.
- **Checkpoints:** Small, Base, Large, Giant (relative), plus metric indoor and outdoor variants. Only Small-hf tested; larger ones are non-commercial.
- **Upstream scripts and Gradio demo:** `run.py`, `run_video.py`, app. Untested.
- **Video:** upstream video script and the paper's consistency claims. Untested.

## Install and doctor
Not a machine executable: a project venv plus a model download. About 1 GB for the venv and about 95 MB (`model.safetensors`, 99,173,660 bytes) for the weights.

```sh
/opt/homebrew/bin/python3.12 -m venv examples/depth-anything-v2-depth-map/output/venv
examples/depth-anything-v2-depth-map/output/venv/bin/pip install -r examples/depth-anything-v2-depth-map/requirements.txt
```
Pins: torch 2.15.0, transformers 5.24.0, numpy 2.5.5, pillow 13.0.0. `vcr doctor` does not establish the venv; check with `output/venv/bin/python -c "import torch, transformers; print(torch.__version__, transformers.__version__)"`. `run.sh` refuses to run without the venv and never installs.

- Use Homebrew Python. The pyenv 3.12.2 build lacks `_lzma` and was not tried here.
- `run.sh` sets `HF_HOME=output/cache`, so the first run downloads the checkpoint there (network once). Nothing goes outside `output/`.

## Smoke test
```sh
cd examples/depth-anything-v2-depth-map && ./run.sh
# expect: depth-anything-v2-depth-map: OK  (output/checks.json matches expected/checks.json: shape 480x640 float32, near 9.1815 > far 0.9429, floor 260/260 pairs, rerun byte-identical)
```
`generate.py` draws the scene, `infer.py` runs the pipeline in two fresh processes, `check.py` measures.

## Recipe
```python
from PIL import Image
from transformers import pipeline

depth = pipeline("depth-estimation", model="depth-anything/Depth-Anything-V2-Small-hf", device="cpu")
map_ = depth(Image.open("scene.png").convert("RGB"))["predicted_depth"].squeeze().numpy()
```
Create the pipeline once per process. Larger value means nearer. Normalise per image if you need a grey preview, and look at it before building on it: the fixture's preview is min-max scaled, so absolute values do not carry between images.

## Troubleshooting
- `No module named '_lzma'`: the venv's Python was built without lzma; rebuild from Homebrew Python.
- A long first run is the weight download; later runs read `output/cache`.
- Far or small objects look flat against the floor: expected here; mask them by other means.
- Expected file differs after bumping torch or transformers: re-inspect before `--record`; the checkpoint commit and library versions are part of the evidence.

## Official docs
- [Depth Anything V2 repository](https://github.com/DepthAnything/Depth-Anything-V2) (paper arXiv 2406.09414)
- [Small-hf model card](https://huggingface.co/depth-anything/Depth-Anything-V2-Small-hf) (Apache-2.0)
- [transformers depth estimation](https://huggingface.co/docs/transformers/tasks/monocular_depth_estimation)
