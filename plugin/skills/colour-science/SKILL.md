---
name: colour-science
description: Use Python colour-science (import colour) for ΔE2000, sRGB to Lab/OKLab conversion and RGB-to-RGB matrices in a venv. VCR evidence is partial: colour-science 0.4.7, numpy 2.5.5, macOS arm64; default sRGB round trips are not exact.
---

# colour-science (Python)

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`. Run it from the workspace (the directory holding `vcr.json`).

## Use cases and limits
- `colour-science` (PyPI, import `colour`) computes colour differences and conversions in Python. Typical VCR jobs: ΔE2000 between brand and rendered colours, sRGB to Lab/OKLab, and linear gamut-matrix conversion such as BT.709 to BT.2020. Which colours to choose belongs to `art-direction` (`ART-COL-01`, `ART-BRD-03`), image-level colour to `image-treatment`, and delivery colour handling to `delivery`; read a rule with `vcr rules info <ID>` rather than copying thresholds here.
- Pick this over `color-js` when the job is already in Python or needs the library's wider model set. For web scenes, OKLCH authoring and CSS gamut mapping in Node, use `color-js`. On the same 8 Sharma pairs both give ΔE2000 identical to 12 significant figures.
- Evidence (partial): colour-science 0.4.7, numpy 2.5.5, Python 3.12.2, macOS arm64. 4 of 6 predeclared checks pass; both failures have one cause, below.
- Not validated: the generic `colour.RGB_to_XYZ` / `XYZ_to_RGB` route (a one-off attempt errored and was not pursued), other ΔE methods, spectral data, appearance models (CAM16), LUTs, transfer functions beyond sRGB, chromatic adaptation, 8-bit quantisation, ICC, other platforms.
- The Sharma rows are a secondary transcription and the BT.2087 coefficients were entered without a PDF check; treat both passes as pending a primary-source check.

## Warning: sRGB round trips are not exact
The default `colour.sRGB_to_XYZ` and `colour.XYZ_to_sRGB` use separately rounded 4-decimal matrices that are not exact inverses (up to 3.1e-5 per entry). Measured on 16 colours:
- sRGB to Lab or OKLab and back drifts up to about 3e-4 per channel (worst for `#0000ff`, `#00ffff`); black is exact.
- White `#ffffff` gives Lab (100, 0.0077, 0.0035), so a*, b* are about 7.7e-3, not 0.
Do not assert round-trip equality or neutral-white a*, b* = 0 at tight tolerances, and do not use a Lab round trip as a lossless storage step. Store the original sRGB. Lab and OKLab themselves are consistent; the error is in the matrices. Differences like ΔE2000 are unaffected at the scale tested.

## Capability map
Discoverability only; the fixture exercises the items marked tested. Index: [documentation](https://colour.readthedocs.org/en/latest/index.html).
- **Conversions:** `sRGB_to_XYZ`, `XYZ_to_sRGB`, `XYZ_to_Lab`, `Lab_to_XYZ`, `XYZ_to_Oklab`, `Oklab_to_XYZ`. Tested with D65 defaults. Many other models documented, untested.
- **Colour difference:** `colour.delta_E(a, b, method="CIE 2000")`. Tested. Other methods untested.
- **RGB colourspaces:** `colour.RGB_to_RGB(v, "ITU-R BT.709", "ITU-R BT.2020", ...)`. Tested linear with adaptation and transfer functions off. Generic `RGB_to_XYZ` route untested.
- **Spectral, appearance models, LUTs, transfer functions, adaptation:** documented, untested.

## Install and doctor
```sh
python3 -m venv examples/colour-science-conversions/output/venv
examples/colour-science-conversions/output/venv/bin/pip install -r examples/colour-science-conversions/requirements.txt
```
Pinned to `colour-science==0.4.7` and `numpy==2.5.5`. A project dependency, not a machine executable; `vcr doctor` does not check it. Check: `<venv>/bin/python -c "import colour; print(colour.__version__)"` prints `0.4.7`. SciPy and Matplotlib are not needed for these functions; importing warns that they are absent, which is harmless here.

## Smoke test
```sh
examples/colour-science-conversions/run.sh
# expect: colour-science-conversions: OK
```
Today it exits 1 and does not print `OK`, because the round-trip and white checks fail by design of the recorded result. Recorded: ΔE2000 within 4.1e-5 of published (largest at pair 7), BT.2020 within 1e-6 of the 6-decimal BT.2087 matrix, round-trip max 2.99e-4, two processes byte-identical. It diffs two runs and then `expected/metrics.json`.

## Recipes (tested)
```python
import colour, numpy as np
xyz = colour.sRGB_to_XYZ(np.array([0.12, 0.34, 0.56]))   # channels 0 to 1
lab = colour.XYZ_to_Lab(xyz)
ok = colour.XYZ_to_Oklab(xyz)
de = colour.delta_E(lab_a, lab_b, method="CIE 2000")      # kL = kC = kH = 1
v2020 = colour.RGB_to_RGB(v, "ITU-R BT.709", "ITU-R BT.2020",
    chromatic_adaptation_transform=None,
    apply_cctf_decoding=False, apply_cctf_encoding=False)  # linear in, linear out
```
- sRGB channels are 0 to 1; divide hex bytes by 255.
- For a linear matrix conversion pass the three flags above, or the call applies transfer functions.
- The fixture's output was byte-identical across two processes; other inputs are untested.

## Troubleshooting
- Import warnings about SciPy or Matplotlib: expected, not needed here.
- Round-trip or white-point assertions fail near 1e-4 to 1e-2: the rounded matrices above, not your code.
- `check.py` stops on a version other than 0.4.7: reinstall from `requirements.txt`.
- `run.sh` says to create the venv: it never installs automatically.

## Official docs
- [colour-science.org](https://www.colour-science.org)
- [Documentation](https://colour.readthedocs.org)
- [Repository](https://github.com/colour-science/colour)
- [0.4.7 on PyPI](https://pypi.org/project/colour-science/0.4.7/)
