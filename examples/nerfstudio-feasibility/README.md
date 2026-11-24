# Nerfstudio feasibility on macOS arm64 (no CUDA)

## Intent and scope

- **Tool/version:** nerfstudio 1.1.5 (PyPI, pinned in `output/venv`), with its pinned dependencies `gsplat==1.4.0` and `nerfacc==0.5.2`. COLMAP 4.2.1 (Homebrew, CPU) as the structure-from-motion step; blender-background is not used.
- **Claim:** on macOS arm64 without CUDA, nerfstudio installs into a venv; `ns-process-data images` turns a predeclared synthetic image set into a `transforms.json` with 20 registered frames; `nerfacto` trains 300 steps on MPS or CPU without error, writes a checkpoint, and a rendered eval image is non-blank.
- **Exclusions:** CUDA kernels (tiny-cuda-nn, gsplat CUDA, nerfacc CUDA) and any result that needs them; splatfacto quality or speed; reconstruction quality, PSNR or novel-view accuracy; real photographs; other methods; Linux or NVIDIA hardware; any version other than 1.1.5.
- **Documentation:** [nerfstudio docs](https://docs.nerf.studio/), [repository](https://github.com/nerfstudio-project/nerfstudio), [LICENSE](https://github.com/nerfstudio-project/nerfstudio/blob/main/LICENSE). Licence: Apache-2.0 for project code. Methods, models and dependencies carry separate terms that are not reviewed here; no pretrained model is downloaded. Checked 2026-11-24.
- **Environment:** macOS 25.6.0 (Darwin) arm64, Apple M3 Pro, 18 GB RAM, Homebrew Python 3.12.13, no NVIDIA GPU or CUDA toolkit. Torch from PyPI (macOS arm64 wheel, MPS available).
- **Input:** `generate.py` renders 20 views of an original procedural textured cube on an orbit (seeded, no external images). Needs Python 3 with numpy and Pillow from the venv.
- **Installation plan:** `python3.12 -m venv output/venv`, then `pip install nerfstudio==1.1.5`. Nothing outside `output/` is written; no system packages, no CUDA, no drivers.
- **Side effects:** venv, generated PNGs, COLMAP database, nerfstudio outputs and checkpoints, all under ignored `output/`. Network is used by pip and by any model or data download nerfstudio triggers; the run aims to need none beyond pip.
- **Workspace and cleanup:** `output/` only. `run.sh` clears `output/` except `output/venv`; delete `output/` to remove everything.

## Plan, before running

- **Commands:** `./run.sh --record`, then `./run.sh`. Each run:
  1. checks COLMAP is 4.2.1 and the venv has `nerfstudio==1.1.5`;
  2. regenerates the 20 PNG views in `output/images`;
  3. `ns-process-data images --data output/images --output-dir output/data --sfm-tool colmap --feature-type sift --matching-method exhaustive --camera-type perspective --num-downscales 0 --no-gpu --colmap-cmd colmap --verbose` (flags confirmed against `ns-process-data images --help` on 2026-11-24, before the first run; `--no-gpu` is set because nerfstudio's default is GPU);
  4. `ns-train nerfacto --data output/data --max-num-iterations 300 --vis tensorboard --output-dir output/train --machine.device-type mps` (`MachineConfig.device_type` is `cpu|cuda|mps`, default `cuda`; `mps` is used because `torch.backends.mps.is_available()` is true on this machine, and `cpu` is the fallback if MPS fails);
  5. `ns-eval`/`ns-render` on the last checkpoint to write one eval image to `output/eval/`;
  6. `verify.py` checks the outputs and compares counts with `expected/*.json`.
- **Predeclared checks:**
  - `ns-process-data` exits 0; `transforms.json` has exactly 20 frames; each frame file exists on disk and carries a 4×4 `transform_matrix`.
  - `ns-train` exits 0 and writes at least one `step-*.ckpt` whose step number is 299 (300 steps counted from 0).
  - Eval image: exists, dimensions match the training images (384×288 or the render's own size), and its RGB standard deviation is above 5 (not blank) and it is not a single colour.
  - Install check: `pip show nerfstudio` reports 1.1.5.
  - `expected/*.json` holds the frame count, step number, image size and device used class (`mps` or `cpu`); it never holds media.
- **Training time cap:** 20 minutes of wall-clock across all training attempts, measured by the run. If exceeded, stop and report.
- **Stop conditions:** install fails; `ns-process-data` fails or registers fewer than 20 frames; training raises an error or needs CUDA (`tinycudann`, `gsplat` CUDA, `nerfacc` CUDA); the time cap is hit; the eval image is blank. A stop is recorded as partial or blocked with the exact error, not worked around.
- **Method:** `nerfacto` only. splatfacto is not attempted under this claim.
- **Inspection:** look at one generated input view, the COLMAP-registered frame list, the loss/log tail, and the eval image, via a contact sheet at `output/contact.png`.
- **Reproduction:** `examples/nerfstudio-feasibility/run.sh --record` then `examples/nerfstudio-feasibility/run.sh`.

### Amendment 1 (2026-11-24, after run 1 failed, before run 2)

- Run 1 (`./run.sh --record`, nerfstudio 1.1.5, COLMAP 4.2.1) passed the image generation and failed inside `ns-process-data`: `colmap feature_extractor` rejected `--SiftExtraction.use_gpu 0` (`unrecognised option`). nerfstudio 1.1.5 was written against COLMAP 3.x option names; COLMAP 4.2.1 renamed `SiftExtraction.use_gpu` to `FeatureExtraction.use_gpu` and `SiftMatching.use_gpu` to `FeatureMatching.use_gpu`. nerfstudio then crashed on a `NoneType` decode while reporting the error.
- Change: `colmap-compat.sh` is passed as `--colmap-cmd`. It renames only those two options and execs the real COLMAP 4.2.1 binary. COLMAP still performs all extraction, matching, mapping and bundle adjustment. Checks, thresholds, the 20-view input, and the training settings are unchanged.
- Not done: no older COLMAP was installed and no system package was added. This amendment is a deviation from the plan and is recorded as such in the observation.

### Amendment 2 (2026-11-24, after run 2 trained but `ns-render` failed, before run 3)

- Run 2 completed COLMAP, `ns-process-data`, and `ns-train` (checkpoint `step-000000299.ckpt` written). `ns-render` then failed in `eval_load_checkpoint`: torch 2.15 defaults `torch.load` to `weights_only=True`, and the nerfstudio checkpoint contains a numpy scalar that is not allow-listed.
- Change: `ns-render` alone runs with `TORCH_FORCE_NO_WEIGHTS_ONLY_LOAD=1`, a torch environment switch that restores the pre-2.6 default. The checkpoint is one this run wrote itself. Training is unchanged.
- Runs 1 and 2 are kept in the observation as history; the evidence run is a clean full run with the amended script.

### Amendment 3 (2026-11-24, after run 3 registered only 2 of 20 frames)

- Run 3 (`./run.sh --record`, clean output) ran COLMAP, `ns-process-data`, and `ns-train` to completion, then `ns-render --split val` failed because the val split was empty. The `transforms.json` had 2 frames, not 20. COLMAP's mapper initialised one pair and then could not register any other image. The database shows 190 matched pairs, 154 of them classed DEGENERATE by COLMAP's two-view geometry, and 36 with 15 or more inliers. The synthetic input is the likely cause: fine, high-frequency random colour cells on flat cube faces give ambiguous matches.
- Change: the frame-count check now runs right after `ns-process-data` (`verify.py process`), so the run stops at the registration gate instead of at the render. The predeclared thresholds are unchanged, including 20 frames. The input set is not redesigned inside this predeclared run; a better-textured input would be a new fixture with its own predeclared claim.
- Supplementary check, not part of run.sh: `ns-render dataset --split train` on run 3's checkpoint wrote two RGB frames (std about 61 to 63, 30k to 33k unique colours). These show the model drawing the cube. They are not held-out evidence and do not replace the predeclared eval check.

## Observation, after running

- **Result: partial.** Install and the COLMAP to `transforms.json` conversion ran on this machine. The predeclared registration check failed: 2 of 20 frames registered, not 20. The scripted run stops there, so its `expected/` holds only the predeclared thresholds and no `measured.json` was written. Training and the render were run outside the scripted path, on the 2-frame set from run 3 (see below).
- **Date and host:** 2026-11-24, `Conors-MacBook-Pro-2.local`, macOS 26.6 arm64 (Darwin 25.6.0), Apple M3 Pro, 18 GB RAM, no CUDA.
- **Versions:** nerfstudio 1.1.5 (`pip show`), gsplat 1.4.0, nerfacc 0.5.2, torch 2.15.0, torchvision 0.29.2, numpy 2.5.5, Python 3.12.13 (Homebrew, `output/venv`), COLMAP 4.2.1 (Homebrew formula 4.2.1_5, CPU, no GPU support), ffmpeg as found on PATH (invoked by `ns-process-data` for image copy). Playwright and Chromium are not used. Node is not used by this fixture.
- **Install:** `pip install nerfstudio==1.1.5` into `output/venv` succeeded with no CUDA toolkit or driver. The venv is 2.1 GB. The install pulled `gsplat==1.4.0` and `nerfacc==0.5.2` without error; no CUDA kernel was compiled or loaded.
- **Input:** 20 PNG views at 384×288 (`output/images`, 560 KB), generated by `generate.py` from an original procedural cube.
- **Run 1 (`--record`):** `ns-process-data` failed in `colmap feature_extractor`: `unrecognised option '--SiftExtraction.use_gpu'`. nerfstudio 1.1.5 uses COLMAP 3.x option names. See Amendment 1 (`colmap-compat.sh`).
- **Run 2 (`--record`):** the shim worked. COLMAP extraction, matching, mapping and bundle adjustment ran; `ns-train nerfacto` ran on MPS for 300 steps (about 0.54 s per step early, 0.68 s near step 290) and wrote `step-000000299.ckpt`. `ns-render` failed in `torch.load` (`weights_only`). See Amendment 2.
- **Run 3 (`--record`):** the same pipeline, with the `weights_only` switch. Training completed again. The transforms file had **2 frames**, not 20. `ns-render --split val` then failed with an empty split (`commonpath() arg is an empty sequence`). COLMAP's mapper registered an initial pair and then could not register any other image.
- **Diagnosis (from `output/data/colmap/database.db`):** keypoints 699 to 856 per image (mean 768). 190 image pairs have matches. COLMAP's two-view geometry classes 154 of them as DEGENERATE and 36 have 15 or more inliers. The likely cause is the input: fine, high-frequency random colour cells on flat cube faces give ambiguous matches. This was not fixed inside this predeclared run.
- **Runs 4 and 5 (scripted, `--record` then plain):** both stop at `FAIL: registered frames 2, predeclared 20`, with exit 1. The plain run reproduces the record run.
- **Supplementary render (not a predeclared check):** `ns-render dataset --split train` on run 3's checkpoint wrote 2 RGB frames, 384×288, RGB std 60.97 and 63.49, 30,611 and 32,587 distinct colours. `output/contact.png` shows the 4 input views (top row) and these 2 renders (bottom row). The renders show the cube drawn from the training poses, with a hazy background and smeared edges, which is expected from 2 frames. They are not held-out evidence and do not satisfy the predeclared eval check.
- **Deviations:** Amendments 1 to 3 above. None changes a predeclared threshold. The run order changed (the frame-count check moved up to fail fast).
- **Limits:** this establishes that nerfstudio 1.1.5 installs and trains on MPS on this Apple Silicon machine, with COLMAP 4.2.1 through a flag shim. It does not establish 20-frame registration, a held-out eval image from the scripted path, quality, speed beyond the step timing above, splatfacto or gsplat rendering, CUDA paths, or any other OS or hardware. Model and dataset licences were not reviewed.
- **Reviewer and follow-up:** a better-textured synthetic input (for example, a non-planar object with smooth shading and fewer repeated edges) would be a new fixture with its own predeclared claim, and should be run before this one is re-run. Revisit when nerfstudio or COLMAP releases a version that matches the option names or the torch default.
