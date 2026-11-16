# G'MIC 8-bit grayscale negate fixture

## Intent and scope

- **Tool and version:** G'MIC CLI 4.0.7 (`gmic version`).
- **Claim:** applying G'MIC `-negate` to an owned 2×2 8-bit grayscale PGM produces the exact inverse sample values and repeatable PGM bytes.
- **Exclusions:** no claim about other filters, color images, higher bit depths, visual quality, other builds, or platform behavior.
- **Environment:** macOS 26.6 arm64; Homebrew G'MIC 4.0.7; ImageMagick 7.1.2-15 used only to inspect the generated PGM.
- **Input:** `source.pgm`, a tiny binary PGM with samples `[0, 64, 128, 255]`; no external assets. Binary PGM avoids a text-PGM parsing issue observed in this G'MIC build.
- **Dependencies and side effects:** `brew install gmic` installed G'MIC 4.0.7 plus/upgraded Homebrew dependencies. G'MIC warned that its default user configuration directory was unwritable; the image operation completed. Fixture outputs stay under ignored `output/`.

## Plan, before running

- **Command:** `gmic source.pgm -negate -o output/negated.pgm`, then repeat to `output/repeat.pgm`.
- **Expected checks:** G'MIC reports 4.0.7; each output is 2×2, max value 255, exact pixels `[255, 191, 127, 0]`; repeated output bytes and SHA-256 match; PGM reopens successfully.
- **Stop conditions:** stop if the input is not parsed as 2×2 grayscale, version is not exact, pixels differ, or repeated output bytes differ.
- **Inspection:** ImageMagick text output confirms the four grayscale samples; rasterize/enlarge to inspect the 2×2 result.

## Observation, after running

- **Date and executor:** 2026-11-15; Codex on `Conors-MacBook-Pro-2.local`, macOS 26.6 arm64.
- **Observed:** G'MIC loaded the 2×2 P5 input as grayscale and wrote a 2×2 P5 output; both runs matched byte-for-byte. Exact samples were `[255, 191, 127, 0]` and SHA-256 is recorded in `expected/metrics.json`.
- **Inspection:** ImageMagick enumerated the expected four grayscale samples at 2×2; the exact-pixel assertion is the visual check for this tiny raster.
- **Result and limits:** passed for the pinned grayscale negate operation only. G'MIC emits a warning that its default user config directory is not writable, but the command and checks completed successfully.
