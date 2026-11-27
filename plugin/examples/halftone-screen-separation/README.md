# halftone-converter screen fixture

## Intent and scope

- **Tool/version:** halftone-converter 2.6.14 (PyPI; CLI `halftonecv`, also `python -m halftonecv`), pinned with its resolved dependencies in `requirements.txt` (numpy 2.5.5, Pillow 13.0.0, pycairo 1.29.2, rich 15.0.0).
- **VCR job and claim:** `halftonecv` turns a still into a halftone whose dot lattice follows the asked screen angle and pitch, each CMYK plate on its own angle, and gives identical bytes on repeat.
- **Exclusions:** ICC separation accuracy (default SWOP profile only), TIFF/CMYK output, RGB mode, dot shape (the tool offers none), per-frame video use, alpha, other platforms.
- **Documentation and licence:** https://github.com/curegit/halftone-converter, README in the wheel `METADATA`. AGPL-3.0-or-later (wheel `METADATA`, checked 2026-11-27). Run as a CLI; do not bundle into distributed code.
- **Environment:** macOS arm64, Python 3.12, venv in ignored `output/venv`. pycairo ships a wheel with Cairo; no system install.
- **Input/rights:** two flat patches built by `check.py` with Pillow: gray 128 and RGB (90, 70, 60), 256x256. No external files.
- **Dependencies, network, side effects:** `run.sh` builds the venv from `requirements.txt` if missing (network at that step only). Writes only under `output/`.
- **Cleanup:** remove `output/`.

## Plan, before running

- **Commands:** `halftonecv -q -f -p 8 -x 2 -d DIR --discard [-A 45 | -a 15 75 0 45 + --keep-* for the three other plates] patch.png`.
- **Predeclared checks (all gating):**
  1. Output size is input times scale (512x512).
  2. Gray at `-A 45`: dominant FFT lattice direction is 45 deg (mod 90) within 2 deg, period within 1 px of 16 px.
  3. Gray mean level is within 5 percent of the input 128.
  4. Gray output is byte-identical on a second run.
  5. For each of C, M, Y, K, halftoning only that plate (other plates kept with `--keep-*`): lattice angle within 2 deg of 15, 75, 0, 45, period within 1 px of 16.
  6. Whole check script gives identical JSON in two processes.
- **Stop conditions:** any failed check is recorded, not loosened.
- **Reproduction:** `examples/halftone-screen-separation/run.sh`.

## Observation, after running

- **Date and executor:** 2026-11-27, Claude agent on Conors-MacBook-Pro-2.local, Python 3.12.
- **Result:** all checks pass. Gray: 45.0 deg, period 15.74 px, mean 128.9. Plates: C 14.5, M 75.5, Y 0.0, K 45.0 deg.
- **Inspection:** gray and K plates at 2x zoom show a clean round-dot lattice at 45 deg, antialiased, no moire at this scale.
- **Deviations:** an earlier exploratory run used a lighter patch (170, 130, 110) whose K plate is nearly empty, so its FFT peak was noise; that was an input choice, made before the checks were frozen, and the patch was darkened. A saturated red patch is unsuitable too: M and Y plates saturate to full coverage and only C shows dots. `-o cmyk` writes a TIFF of the rendered image, not separated plates.
- **Establishes / does not:** a still halftone follows the asked angle and pitch per plate, deterministically, on this machine. Not ICC accuracy, video use or other hosts.
