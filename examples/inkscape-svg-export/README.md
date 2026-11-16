# Inkscape CLI SVG-export fixture

## Intent and scope

- **Tool/version:** Inkscape 1.4.4 CLI page export to PNG.
- **Claim:** export an authored 64×48 SVG page to a 128×96 PNG and verify exact color samples, transparency and repeated output bytes.
- **Exclusions:** object-id export, actions, PDF/EPS conversion, text conversion, SVG repair, GUI operations, other versions or platforms.
- **Documentation:** [Inkscape command-line usage](https://wiki.inkscape.org/wiki/Using_the_Command_Line). Checked 2026-11-16.
- **Environment:** macOS 26.6 arm64 (Darwin 25.6.0), Inkscape 1.4.4, ImageMagick 7.1.2-35. The executable can be selected with `INKSCAPE_BIN`.
- **Input:** `input.svg` is an original two-shape vector drawing with no fonts, linked assets or external media.
- **Side effects:** writes two PNGs under ignored `output/`.

## Plan, before running

- **Commands:** `./run.sh --record`, then `./run.sh`. The runner uses subprocess timeouts, exports the page twice and uses ImageMagick for pixel inspection.
- **Checks:** exact Inkscape version; output 128×96; blue center `[21,101,192,255]`; red sample `[229,57,53,255]`; transparent corner; exact repeated PNG bytes and hash.
- **Stop conditions:** version mismatch, command timeout, export failure, unexpected dimensions or pixels, or unequal repeat output.
- **Inspection:** inspect `output/first.png` at native size; it should show a blue circle over a red rectangle with transparency outside the SVG page.

## Observation, after running

- **Result:** pass. The version probe exited in under a second. `./run.sh --record` and a separate clean-output `./run.sh` both passed.
- **Measurements:** 128×96 PNG; center `[21,101,192,255]`, red sample `[229,57,53,255]`, corner `[0,0,0,0]`; repeated PNG SHA-256 `21cc85c081a6ad91391b6bfa302228f88503759d42b0f6409e2f052a8b9ccf95`.
- **Runtime:** Inkscape 1.4.4, ImageMagick 7.1.2-35, macOS 26.6 arm64.
- **Visual inspection:** inspected the PNG; it contains the intended blue circle and red rectangle on transparency.
- **Limits:** this validates page export from one small SVG. It does not establish other export areas, object actions, conversions, text handling or GUI workflows.
