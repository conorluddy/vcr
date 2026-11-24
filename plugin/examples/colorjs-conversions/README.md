# Color.js conversions fixture

## Intent and scope

- **Tool/version:** Color.js (`colorjs.io`) 0.7.1, pinned exactly in the example-local `package.json`. Latest on npm at check time; the catalogue card records 0.7.0 as seen on 2026-11-15.
- **VCR job and claim:** In Node, Color.js (a) converts a predeclared set of sRGB colours to OKLCH and back within 1e-6, (b) gamut-maps out-of-gamut OKLCH colours into sRGB, and (c) computes ΔE2000 for the Sharma et al. reference pairs within 1e-4 of the published values.
- **Exclusions:** no browser or canvas rendering, no image or media output, no contrast/WCAG ratio (the card says to use a dedicated checker), no other ΔE methods, no interpolation or palette generation, no CSS string parsing beyond the fixed inputs, no claim about perceptual quality of the gamut mapping, no ICC or wide-gamut display output.
- **Documentation and licence:** [colorjs.io](https://colorjs.io) and [color-js/color.js](https://github.com/color-js/color.js). Licence MIT (read from the 0.7.1 npm tarball `LICENSE` and `package.json`), checked 2026-11-24. The reference pairs are from Sharma, Wu and Dalal (2005), "The CIEDE2000 Color-Difference Formula: Implementation Notes, Supplementary Test Data, and Mathematical Observations", *Color Research & Application* 30(1):21–30, supplementary test data (CIE technical report pairs). See the fixture note below on how the values were sourced.
- **Environment:** Node and macOS on this machine (recorded in Observation). No GPU, no browser.
- **Input/rights:** all inputs are literal numbers written in `run.mjs` (predeclared sRGB hex values, three OKLCH colours, and Lab triples from the Sharma table). No external files.
- **Dependencies, installation, network, side effects:** one exact npm dependency (`colorjs.io@0.7.1`) installed into this example's `node_modules` through the pnpm workspace. No global install, no network at run time, no writes outside `output/` and `expected/`.
- **Workspace and cleanup:** `output/` is ignored generated output; `expected/metrics.json` is the only retained file.

### Sourcing note for the reference pairs

The paper's host (`www2.ece.rochester.edu`) did not resolve from this machine, so the PDF was not read directly. The eight rows used here were taken from the Sharma et al. pairs as transcribed in `tests/main.js` of the npm package `delta-e@0.0.8`, which cites the paper for those cases, and the published ΔE00 values are the ones given there. This is a secondary transcription; a reviewer with the PDF should confirm the rows and values against Table 1 before relying on the ΔE part of the claim.

## Plan, before running

- **Commands:** `pnpm install` at the repository root (installs this example's dependency), then `examples/colorjs-conversions/run.sh --record`, then `examples/colorjs-conversions/run.sh`. `run.sh` runs `node run.mjs` twice in separate processes and diffs them.
- **Versions:** `colorjs.io` 0.7.1 (exact, asserted by reading the installed `package.json`); Node 22.19.0 on this machine (any Node 22.x is the planned runtime; the script asserts major version ≥ 22). No Playwright, no ImageMagick.
- **Predeclared inputs:**
  - Round-trip sRGB set (hex): `#000000`, `#ffffff`, `#ff0000`, `#00ff00`, `#0000ff`, `#ffff00`, `#00ffff`, `#ff00ff`, `#808080`, `#1e90ff`, `#ff8c00`, `#2f4f4f`, `#7b3fa0`, `#abcdef`, `#123456`, `#f5deb3`.
  - Out-of-gamut OKLCH colours: `oklch(0.70 0.40 150)`, `oklch(0.60 0.35 30)`, `oklch(0.90 0.30 110)`, `oklch(0.50 0.30 280)`.
  - Sharma pairs (Lab, ΔE00 published to 4 dp): #1 (2.0425), #2 (2.8615), #7 (2.3669), #9 (7.1792), #17 (27.1492), #25 (1.2644), #26 (1.2630), #28 (1.8645).
- **Predeclared checks and tolerances:**
  1. Installed `colorjs.io` version equals `0.7.1`.
  2. Round trip: for every sRGB colour, each channel of `srgb → oklch → srgb` differs from the input by less than `1e-6` (on a 0–1 scale). Non-finite values fail.
  3. Gamut mapping: each of the four OKLCH colours is outside sRGB before mapping (`inGamut("srgb")` false). After `toGamut({ space: "srgb", method: "css" })`, each channel is within `[0, 1]` with tolerance `1e-9`, `inGamut("srgb")` is true, and OKLCH lightness moves by no more than `0.02`.
  4. ΔE2000: `Color.deltaE(lab1, lab2, { method: "2000" })` is within `1e-4` of the published value for every listed pair (published values are rounded to 4 dp, so rounding alone is at most `5e-5`).
  5. Repeatability: two separate Node processes produce byte-identical JSON.
- **Expected artifacts:** `expected/metrics.json`: version, Node version, per-colour round-trip max error, gamut results, and ΔE values with published values and absolute differences.
- **Intended consumer:** none; this is a numeric library check. No handoff settings.
- **Stop conditions:** stop if the version differs; if a round trip produces NaN for any colour (report which one, do not drop it); or if process outputs differ.
- **Failure interpretation:** any failing check 1, 2, 3 or 5 gives `fail`. If only check 4 fails, the result is `partial` with the failing pairs named.
- **Reproduction:** `pnpm install && examples/colorjs-conversions/run.sh` from the repository root. To inspect, read `output/first.json`.

## Observation, after running

- **Date and executor:** 2026-11-24; Claude agent in a VCR worktree on `Conors-MacBook-Pro-2.local`, macOS 26.6 arm64.
- **Versions:** `colorjs.io` 0.7.1 (installed `package.json` read by the script); Node 22.19.0; pnpm 10.29.2 (workspace install). No Playwright, Chromium or ImageMagick used.
- **Commands:** `pnpm install` at the repository root; `examples/colorjs-conversions/run.sh --record`; `examples/colorjs-conversions/run.sh` printed `colorjs-conversions: OK` (exit 0).
- **Run-1 correction:** the first `--record` attempt crashed in the script's own serialisation, not in the tool. Achromatic colours have a missing hue (`null`, CSS "none") in OKLCH; the script called `.toPrecision` on it. The script now keeps `null` as `null`. No predeclared check or tolerance was changed.
- **Round trip (check 2):** 16 sRGB colours, all within `1e-6`. Largest observed error `3.5e-14` (`#00ff00`). Black and mid-grey have hue `none`.
- **Gamut mapping (check 3):** all four out-of-gamut OKLCH inputs were outside sRGB before mapping and inside after `toGamut({ space: "srgb", method: "css" })`. Largest lightness shift `0.0137` (`oklch(0.60 0.35 30)`), inside `0.02`. Mapped channels are within `1e-14` of the `[0, 1]` bounds.
- **ΔE2000 (check 4):** eight Sharma pairs (#1, #2, #7, #9, #17, #25, #26, #28). Largest absolute difference from the published value `4.1e-5` (#7), inside `1e-4`; the published values are themselves rounded to 4 dp, so this is at the rounding floor.
- **Repeatability (check 5):** two separate Node processes produced identical JSON (`diff` clean).
- **Inspection:** no media. The numeric results are the deliverable; the recorded values in `expected/metrics.json` were read and are consistent with the predeclared tolerances.
- **Outcome:** pass for the three parts of the claim on this machine with colorjs.io 0.7.1 and Node 22.19.0.
- **Limits:** the ΔE reference values come from a secondary transcription (see sourcing note), not from the paper PDF, which could not be fetched. Only the eight listed pairs are covered, not all 34 Sharma pairs. Only the four listed OKLCH colours were gamut-mapped; the CSS method was the only mapping tested. No claim about other Node versions, other OSes, other gamut-mapping methods, or the perceptual quality of the mapping.
- **Reviewer, follow-up:** a reviewer with the Sharma PDF should confirm the eight rows and values against Table 1. Revisit if colorjs.io changes its ΔE2000 or CSS gamut-mapping code.
