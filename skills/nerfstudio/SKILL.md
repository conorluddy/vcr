---
name: nerfstudio
description: Train neural radiance field models from posed images with nerfstudio (ns-process-data, ns-train nerfacto, ns-render). Load for small reconstruction experiments on a Mac without CUDA; COLMAP supplies the poses.
---

# Nerfstudio

`vcr` below means `node <plugin-root>/cli/vcr.mjs`; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Evidence is PARTIAL. On macOS arm64 (Apple M3 Pro, 18 GB, no CUDA) with nerfstudio 1.1.5, torch 2.15.0, gsplat 1.4.0, nerfacc 0.5.2 and COLMAP 4.2.1: pip install works (venv about 2.1 GB); `ns-process-data images` runs through COLMAP; `ns-train nerfacto --machine.device-type mps` trains 300 steps (about 0.6 s per step) and writes `step-000000299.ckpt`; train-split renders are non-blank (RGB std about 61 to 63).
- Not shown: 20-frame registration (COLMAP registered 2 of 20 synthetic views), a held-out eval render, reconstruction quality, splatfacto, CUDA paths (tiny-cuda-nn, gsplat and nerfacc CUDA kernels), other OSes. Treat the Mac as a place for small experiments; MPS training is slow.
- COLMAP does the pose estimation: see the `colmap` skill. For splat files, use `splat-transform` (not covered here). Model and dataset licences were not reviewed.
- For a conventional editable 3D model use Blender; for mesh processing without training use Trimesh.

## Capability map
Discovery only; documented does not mean validated.
- Data processing: `ns-process-data` (images, video, other capture formats) at [data docs](https://docs.nerf.studio/quickstart/custom_dataset.html). Tested: `images` with COLMAP SIFT, exhaustive matching.
- Training: `ns-train <method>` at [methods](https://docs.nerf.studio/nerfology/methods/index.html). Tested: `nerfacto` only. Untested: splatfacto and other methods.
- Rendering and export: `ns-render`, `ns-eval`, `ns-export` ([export docs](https://docs.nerf.studio/quickstart/export_geometry.html)). Tested: `ns-render dataset` on train and val splits. Untested: camera paths, `ns-export`, `ns-eval`.
- Viewer: `ns-viewer`. Untested (the fixture uses `--vis tensorboard`).

## Install and doctor
```sh
python3.12 -m venv ~/nerfstudio-venv && ~/nerfstudio-venv/bin/pip install nerfstudio==1.1.5
~/nerfstudio-venv/bin/ns-train --help   # check
```
Run `vcr doctor` to record availability; this guide does not imply it is installed. COLMAP 4.2.1 must be on PATH.

## Smoke test
```text
examples/nerfstudio-feasibility/run.sh
# expect (current, partial): exits 1 at "FAIL: registered frames 2, predeclared 20"
```
The fixture needs `output/venv` with nerfstudio 1.1.5. The full 20-frame result is not yet achieved; the training and render steps were run outside the scripted path on the 2-frame set.

## Recipe (what ran)
```sh
ns-process-data images --data imgs --output-dir data --sfm-tool colmap --feature-type sift \
  --matching-method exhaustive --camera-type perspective --num-downscales 0 --no-gpu \
  --colmap-cmd "$PWD/colmap-compat.sh"
ns-train nerfacto --data data --max-num-iterations 300 --vis tensorboard \
  --output-dir train --machine.device-type mps
TORCH_FORCE_NO_WEIGHTS_ONLY_LOAD=1 ns-render dataset --load-config train/.../config.yml \
  --output-path eval --split train --rendered-output-names rgb --image-format png
```
- `--machine.device-type` defaults to `cuda`; pass `mps` (or `cpu`) here.
- `colmap-compat.sh` (in the example) renames `--SiftExtraction.use_gpu` and `--SiftMatching.use_gpu` to `--FeatureExtraction.use_gpu` and `--FeatureMatching.use_gpu`, then execs COLMAP.
- Set `TORCH_FORCE_NO_WEIGHTS_ONLY_LOAD=1` only for checkpoints you trust, and only for `ns-render`.

## Troubleshooting
- `unrecognised option '--SiftExtraction.use_gpu'`, then a `NoneType` decode crash: nerfstudio 1.1.5 passes COLMAP 3 flag names that COLMAP 4 renamed. Use the wrapper above via `--colmap-cmd`.
- Only a few frames in `transforms.json` (2 of 20 seen): flat faces with random colour cells give DEGENERATE two-view geometry (154 of 190 matched pairs). Use real photos or a richly textured, non-planar, overlapping set. An empty val split then breaks `ns-render --split val` (`commonpath() arg is an empty sequence`).
- `ns-render` fails in `torch.load` (weights_only, numpy scalar): set `TORCH_FORCE_NO_WEIGHTS_ONLY_LOAD=1` for trusted checkpoints.
- Training needs `tinycudann` or CUDA kernels: not tested here; stay on nerfacto with MPS.

## Official docs
- [Nerfstudio docs](https://docs.nerf.studio/)
- [Repository](https://github.com/nerfstudio-project/nerfstudio)
- [COLMAP guide](../colmap/SKILL.md)
