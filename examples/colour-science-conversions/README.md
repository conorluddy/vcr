# colour-science conversions fixture

## Intent and scope

- **Tool/version:** colour-science (PyPI `colour-science`, import `colour`) 0.4.7, pinned exactly in `requirements.txt` together with its resolved numpy 2.5.5. Latest on PyPI at check time (2026-11-24); the catalogue card records 0.4.7 as seen on 2026-11-15.
- **VCR job and claim:** colour-science, run from Python, (a) converts a predeclared set of sRGB colours to CIE Lab and to OKLab and back to sRGB, with each channel within `1e-6` of the input; (b) computes CIEDE2000 (`method="CIE 2000"`, kL = kC = kH = 1) for the eight Sharma et al. pairs within `1e-4` of the published values; and (c) converts predeclared BT.709 linear RGB values through the BT.2020 matrix within `1e-5` of values computed from the published ITU-R BT.2087 matrix.
- **Exclusions:** no spectral data, appearance models (CAM16 and others), LUTs, transfer-function curves beyond the sRGB encode/decode used by the round trip, chromatic adaptation other than the identity (both spaces are D65), ICC or display output, 8-bit quantisation, other ΔE methods, and any perceptual-quality claim. No optional SciPy or Matplotlib features are used; the venv does not install them, and `colour` warns about their absence on import. No media, so no contact sheet.
- **Documentation and licence:** [colour-science.org](https://www.colour-science.org), [colour.readthedocs.org](https://colour.readthedocs.org), [github.com/colour-science/colour](https://github.com/colour-science/colour). Licence BSD-3-Clause, read from the installed 0.4.7 `METADATA` and `licenses/LICENSE`, checked 2026-11-24. The ITU-R BT.2087 matrix is a published standard; the rows used here are recorded in `check.py` from the standard's 6-decimal table, not read from the library.
- **Environment:** macOS arm64 with Python 3.12.2 from pyenv, in a venv under `output/`. No GPU, no browser, no Node.
- **Input/rights:** all inputs are literal numbers in `check.py`: 16 sRGB hex colours (the same list as `colorjs-conversions`), the Sharma pairs (same rows as `colorjs-conversions`), and six linear BT.709 vectors. No external files.
- **Dependencies, installation, network, side effects:** approved install only, into `examples/colour-science-conversions/output/venv` (git-ignored). `colour-science==0.4.7` and its resolved numpy are installed with pip from PyPI. No `.venv` in the example, no global install, no network at run time. The venv is recreated with `python3 -m venv output/venv && output/venv/bin/pip install -r requirements.txt`.
- **Workspace and cleanup:** `output/` (venv, run outputs) is ignored. Committed: `README.md`, `example.json`, `requirements.txt`, `run.sh`, `check.py`, `expected/metrics.json`. Cleanup: remove `output/`.

### Sourcing note for the reference values

- **Sharma pairs:** the eight rows are copied from `examples/colorjs-conversions/run.mjs`, which took them from the npm package `delta-e@0.0.8` tests (a secondary transcription of Sharma, Wu and Dalal 2005, Table 1). The paper PDF was not read. Sharing rows with colorjs is deliberate: the two tools are cross-checked on identical inputs, which does not by itself validate the rows.
- **BT.2087 matrix:** the nine coefficients as published in ITU-R BT.2087 Table 2 (6 decimals), written from the standard's table into `check.py`. A reviewer should confirm them against the standard. colour-science's own matrix agrees with them to about 1e-6 (see Observation), but that agreement is not the check.

## Plan, before running

- **Commands:** `output/venv` created and `requirements.txt` installed (see above). Then `examples/colour-science-conversions/run.sh --record`, then `examples/colour-science-conversions/run.sh`. `run.sh` runs `check.py` twice in separate processes, diffs the two outputs, and then compares with `expected/metrics.json`.
- **Versions:** colour-science 0.4.7 (asserted by `check.py` via `colour.__version__`); numpy 2.5.5 (resolved, recorded in `requirements.txt`); Python 3.12.2 (recorded in output, not gated).
- **Predeclared inputs:**
  - Round-trip sRGB set (hex, same as colorjs): `#000000`, `#ffffff`, `#ff0000`, `#00ff00`, `#0000ff`, `#ffff00`, `#00ffff`, `#ff00ff`, `#808080`, `#1e90ff`, `#ff8c00`, `#2f4f4f`, `#7b3fa0`, `#abcdef`, `#123456`, `#f5deb3`.
  - Sharma pairs (Lab, published ΔE00 to 4 dp): #1 (2.0425), #2 (2.8615), #7 (2.3669), #9 (7.1792), #17 (27.1492), #25 (1.2644), #26 (1.2630), #28 (1.8645).
  - BT.709 linear vectors: `[1,0,0]`, `[0,1,0]`, `[0,0,1]`, `[0.5,0.25,0.75]`, `[0.2,0.4,0.6]`, `[1,1,1]`.
- **Conversion path:** sRGB to XYZ with `colour.sRGB_to_XYZ`, XYZ to Lab with `colour.XYZ_to_Lab` and back with `colour.Lab_to_XYZ`, then `colour.XYZ_to_sRGB`. The same path with `colour.XYZ_to_Oklab` and `colour.Oklab_to_XYZ` for OKLab. Default D65 white in both.
- **Predeclared checks and tolerances:**
  1. Installed `colour-science` version equals `0.4.7`. Gating.
  2. Round trip: for every sRGB colour and for both Lab and OKLab, each channel of `sRGB → XYZ → space → XYZ → sRGB` differs from the input by less than `1e-6`. All values finite. Gating; a failure here is `fail`.
  3. White sanity: `#ffffff` gives Lab L* within `1e-6` of 100 and a*, b* within `1e-6` of 0. Gating.
  4. ΔE2000: `colour.delta_E(lab1, lab2, method="CIE 2000")` is within `1e-4` of the published value for each of the eight pairs. Gating for the claim part (b); if only this check fails the result is `partial`, with the failing pairs named.
  5. BT.2020 conversion: `colour.RGB_to_RGB(v, "ITU-R BT.709", "ITU-R BT.2020", chromatic_adaptation_transform=None, apply_cctf_decoding=False, apply_cctf_encoding=False)` for each input vector (linear, so no transfer function; both spaces are D65, so no adaptation) is within `1e-5` of the published matrix times the same vector, per channel. Gating for claim part (c); a failure is `partial` if only this check fails.
  6. Repeatability: two separate Python processes produce byte-identical JSON. Gating.
- **Expected artifacts:** `expected/metrics.json` (library version, Python version, tolerances, per-colour round-trip max errors for Lab and OKLab, the white sanity values, ΔE rows with published values and absolute differences, and the BT.2020 rows with the library output and the published expectation).
- **Intended consumer:** none. Numeric library check; no handoff settings.
- **Stop conditions:** stop if `colour.__version__` is not `0.4.7`; if any round trip yields NaN or infinity (report which colour, do not drop it); or if the two repeat processes differ.
- **Failure interpretation:** any failure of checks 1, 2, 3 or 6 is `fail`. Only check 4 and/or check 5 failing is `partial`, scope naming the failing rows.
- **Reproduction:** from the repository root, `python3 -m venv examples/colour-science-conversions/output/venv && examples/colour-science-conversions/output/venv/bin/pip install -r examples/colour-science-conversions/requirements.txt`, then `examples/colour-science-conversions/run.sh`. Inspect `output/first.json` (ignored).

## Observation, after running

- **Date and executor:** 2026-11-24; Claude agent in a VCR worktree on `Conors-MacBook-Pro-2.local`, macOS 26.6 arm64.
- **Versions:** colour-science 0.4.7 (`colour.__version__`); numpy 2.5.5; Python 3.12.2 (pyenv) in `output/venv`; the full freeze is `output/dependencies.txt`. SciPy and Matplotlib are not installed; `colour` warns about both on import and the checks do not use them. Node, Playwright and Chromium are not used.
- **Commands:** `python3 -m venv output/venv`; `output/venv/bin/pip install colour-science==0.4.7` (pip resolved numpy 2.5.5); `run.sh --record`, which wrote `expected/metrics.json` and exited 1 because a predeclared check failed; `run.sh`, whose two processes produced identical JSON (repeatability passes) and which then exited 1 on the `all_passed` gate, so it does not print `OK`.

Predeclared checks, as run:

| # | Check | Result |
| --- | --- | --- |
| 1 | colour-science version is 0.4.7 | pass |
| 2 | Lab and OKLab round trip within 1e-6 (16 sRGB colours) | **fail**: every colour except black is above 1e-6; largest error 2.99e-4 (`#0000ff`, `#00ffff`) |
| 3 | `#ffffff` Lab within 1e-6 of (100, 0, 0) | **fail**: (100, 0.0077283, 0.0035353), deviation 7.7e-3 |
| 4 | CIEDE2000, 8 Sharma pairs within 1e-4 | pass: largest absolute difference 4.12e-5 (pair 7) |
| 5 | BT.709 to BT.2020 linear, 6 vectors, within 1e-5 of published matrix | pass: largest deviation 1.0e-6 (`[1,1,1]`) |
| 6 | Two processes give byte-identical JSON | pass |

- **Verdict:** **fail** under the predeclared rule (any failure of checks 2 or 3 is `fail`). Parts (b) ΔE2000 and (c) BT.2020 pass on the predeclared rows and tolerances; part (a), the sRGB to Lab/OKLab round trip, does not meet its 1e-6 tolerance on the library's default route.
- **Diagnosis (one-off inspection, not a gate):** colour-science 0.4.7 stores the sRGB forward matrix (`RGB_COLOURSPACES['sRGB'].matrix_RGB_to_XYZ`, the 4-decimal IEC values) and a separately rounded 4-decimal inverse (`matrix_XYZ_to_RGB`). The two are not exact inverses: they differ by up to 3.1e-5 per entry. So `XYZ_to_sRGB(sRGB_to_XYZ([1,0,0]))` returns `[0.99999637, 0.00027998, 0.00000491]`, not `[1,0,0]`. The white check fails for a related reason: `sRGB_to_XYZ([1,1,1])` is `(0.9505, 1, 1.089)`, rounded, while the Lab reference white from the D65 chromaticity is `(0.950456, 1, 1.089058)`, so the white's a*, b* are not zero. Lab and OKLab themselves are consistent: `XYZ_to_Lab` and `Lab_to_XYZ` (and the OKLab pair) return the input XYZ to print precision for red. Whether a generic `RGB_to_XYZ`/`XYZ_to_RGB` route with the same colourspace object closes the gap was **not tested**: a one-off attempt failed on an argument-type error and was not pursued, and switching routes after a failed gate would not be a predeclared result.
- **Measured values (from `expected/metrics.json`):** Lab round-trip max 2.99e-4, OKLab round-trip max 2.99e-4, white Lab (100, 0.0077283, 0.0035353). ΔE2000 rows: #1 2.04245968, #2 2.86151017, #7 2.36685882, #9 7.17917201, #17 27.1492313, #25 1.26442001, #26 1.26295930, #28 1.86449523; absolute differences 4.7e-6 to 4.1e-5. The computed values match the colorjs-conversions `expected/metrics.json` to all 12 significant figures shown. BT.2020 rows: `[1,0,0]` gives `[0.627404, 0.069097, 0.016391]` at the 6-decimal published values; the 1e-6 maximum deviation is the published matrix's own rounding (its row sums are 1.000000, 0.999999, 0.999999).
- **Sourcing:** the Sharma rows are the same secondary transcription as colorjs-conversions; the BT.2087 coefficients were entered from the standard's 6-decimal table without a PDF check. Both are unverified against the primary documents here.
- **What this does and does not establish:** on this machine with colour-science 0.4.7 and Python 3.12.2, the library's ΔE2000 agrees with the published Sharma rows (and with Color.js 0.7.1 on the same rows) within 1e-4, and its BT.709 to BT.2020 matrix agrees with BT.2087 at 6 decimals. It does not establish sRGB to Lab/OKLab round trips at 1e-6 on the default sRGB route, which fail by about 3e-4 in linear light. It does not establish other colour-science models, spectral data, other Python versions, or other platforms.
- **Reviewer, decision and revisit triggers:** a reviewer decides whether the round-trip tolerance should be relaxed to the library's documented sRGB precision (a new predeclared check, not an edit to this one) or whether a generic RGB route should be tested in a new fixture. Revisit on any colour-science release, a change to its sRGB matrices, or a numpy upgrade.
