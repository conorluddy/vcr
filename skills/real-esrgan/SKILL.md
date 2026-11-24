---
name: real-esrgan
description: "Unproven in VCR: Real-ESRGAN model-based 4x image upscaling via the ncnn-Vulkan binary; the fixture ran exactly 4x and deterministically but failed a PSNR/SSIM margin over bicubic, so every recipe is documentation-only."
---

# Real-ESRGAN (unproven)

`vcr` below means `node <plugin-root>/cli/vcr.mjs`; inside the VCR repository it is `pnpm vcr`.

## Status

**Unproven.** No passing evidence. The record stays `not-validated`, `documentation_status: listed-in-prd`.

- Recorded fail, `examples/real-esrgan-upscale/` (release asset `realesrgan-ncnn-vulkan-20220424-macos.zip`, Real-ESRGAN v0.2.5.0, macOS arm64, Vulkan via MoltenVK on Apple M3, 2026-11-24): `realesrgan-x4plus -s 4` on a 160x120 still (box-downscaled from a 640x480 synthetic scene). Output 640x480, exact 4x. PSNR 20.46 dB against bicubic 20.27 (margin 1.0 dB required, not met); SSIM 0.9258 against 0.9210 (margin 0.010 required, not met). A fresh-process rerun was byte-identical. Predeclared result: fail.
- Cause: PSNR and SSIM reward pixel fidelity to the original, which a GAN upscaler does not optimise for; it invents plausible texture. On a synthetic scene of flat fills, hard edges and 1 px stripes there is little texture to invent, so the metric is the wrong judge. The fixture's size and determinism claims held.
- Next fixture to try: photographic (or at least textured, degraded) input, judged with a perceptual metric (dssim, or LPIPS if a Python route is later approved) plus a human look at 1:1 crops, with bicubic and Lanczos as baselines. Declare margins before running.

## Use cases and limits
- Intended job: enlarge a low-resolution raster (photo, texture, scan) where plain resampling looks soft; relates to `DELIVERY-SOFTNESS`. Output is invented detail, not recovered detail: keep the source, and do not use it where fidelity to the original matters.
- Not for predictable simple resizing: use libvips or ImageMagick. Video sequences are untested; per-frame models may flicker across frames (documentation-only caution).
- Weight terms are not verified. Project code is BSD-3-Clause; the ncnn wrapper binary is MIT; the fixture found no separate weight licence file. Review before redistributing models or outputs commercially.
- Untested in VCR: other models, `-s 2`/`-s 3`, TTA (`-x`), the PyTorch route, tiling seams, other GPUs, real photographs, video.

## What the failed fixture taught
Observed in the failed fixture:
- The release binary is universal (x86_64 + arm64) with MoltenVK linked in; no Python, PyTorch or Vulkan SDK needed.
- The wrapper's v0.2.0 macOS zip bundles no models; the Real-ESRGAN v0.2.5.0 asset does (`realesrgan-x4plus.bin` and `.param`).
- `unzip` drops the execute bit; `chmod u+x` on the one binary was needed. `curl` set no quarantine attribute.
- Output size was exactly 4x and a repeat run in a fresh process was byte-identical on that machine. No claim across GPUs or drivers.
- Margins over bicubic were +0.19 dB PSNR and +0.005 SSIM: positive but below the declared bars. Do not read this as "Real-ESRGAN is no better than bicubic"; it is one synthetic image.

## Capability map
From the [repository README](https://github.com/xinntao/Real-ESRGAN) and the release zip's `README_macos.md`; documentation-only except the ncnn `x4plus` 4x run.
- **ncnn-Vulkan binary:** `-i input -o output -n model -s scale -f format`; also `-m model_dir`, `-t tile`, `-g gpu`, `-x` TTA. Tested: `-n realesrgan-x4plus -s 4`.
- **Models listed there:** `realesrgan-x4plus`, `realesrgan-x4plus-anime`, `realesr-animevideov3`, `realesr-general-*`. Only `x4plus` tested.
- **Python package** (`realesrgan`, PyTorch, optional GFPGAN face enhancement): untested.

## Install and doctor
The record's install line downloads the release zip into the example's ignored `output/bin/`; it is not a global install. The check is `examples/real-esrgan-upscale/output/bin/release/realesrgan-ncnn-vulkan -h 2>&1 | head -1`. `vcr doctor` does not probe candidates; never claim it is installed.

## Smoke test
```sh
vcr example create real-esrgan-upscale
cd examples/real-esrgan-upscale && ./run.sh
# expect today: the recorded fail on the PSNR/SSIM margin checks (size and rerun checks hold)
```
`run.sh` verifies the zip and model hashes and stops on a mismatch.

## Recipe (documentation-only, untested in VCR beyond the 4x run)
```sh
realesrgan-ncnn-vulkan -i in.png -o out.png -n realesrgan-x4plus -s 4
```
Judge by eye at 1:1 and with dssim against a reference, never PSNR alone. For a 2x target, resizing the 4x result down with libvips is an untested combination.

## Validated neighbours to use today
- libvips: fast resize with Lanczos3 (`skills/libvips/SKILL.md`).
- ImageMagick: `-resize` with named filters (`skills/imagemagick/SKILL.md`).
- dssim: perceptual scoring of any resize against a reference (`skills/dssim/SKILL.md`).

## Troubleshooting
- Permission denied on the binary: `chmod u+x` it. Observed.
- No models found: you used the wrapper v0.2.0 zip; use the v0.2.5.0 asset or pass `-m`. Observed.
- Gatekeeper block (not hit): clear quarantine on that one file only (documentation-only).

## Official docs
- [Real-ESRGAN](https://github.com/xinntao/Real-ESRGAN), [releases](https://github.com/xinntao/Real-ESRGAN/releases), [ncnn-Vulkan wrapper](https://github.com/xinntao/Real-ESRGAN-ncnn-vulkan)
- Licences: BSD-3-Clause (project), MIT (wrapper binary), weights unverified.
