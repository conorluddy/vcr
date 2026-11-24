---
name: color-js
description: Use Color.js (colorjs.io) in Node to convert colours between spaces such as sRGB and OKLCH, gamut-map to sRGB and compute ΔE2000. VCR evidence covers only those three jobs with colorjs.io 0.7.1 on Node 22.
---

# Color.js

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`. Run it from the workspace (the directory holding `vcr.json`).

## Use cases and limits
- Color.js (npm `colorjs.io`) converts, gamut-maps and compares colours in code. Typical VCR jobs: author palette tokens in OKLCH and map them into sRGB, and measure brand drift with ΔE2000. Which colours to choose belongs to `art-direction` (see `ART-COL-01` tokens in OKLCH mapped via CSS Color 4, `ART-BRD-03` ΔE00 code validated), image-level colour to `image-treatment`, and access needs to `accessibility`; read the rule with `vcr rules info <ID>` rather than copying thresholds here.
- Evidence is Node only, colorjs.io 0.7.1, Node 22.19.0, macOS arm64: an sRGB to OKLCH to sRGB round trip, CSS gamut mapping to sRGB, and ΔE2000 on 8 Sharma pairs.
- Not validated: browsers or canvas, contrast ratios (use a dedicated checker), other ΔE methods, other gamut-mapping methods, interpolation, palette generation, CSS string parsing, wide-gamut display output.
- The ΔE reference values were a secondary transcription, not read from the Sharma paper; treat the ΔE result as pending a check against the paper.

## Capability map
Discoverability only; the fixture exercises the items marked tested.
- **Construction and conversion:** `new Color(space, coords)`, `.to(space)`, `.coords`. Tested for sRGB and OKLCH; other spaces untested. [Spaces](https://colorjs.io/docs/spaces), [converting](https://colorjs.io/docs/converting).
- **Gamut mapping:** `inGamut(space)`, `toGamut({ space, method })`. Tested: space `srgb`, method `css`. Other methods untested. [Gamut mapping](https://colorjs.io/docs/gamut-mapping).
- **Colour difference:** `Color.deltaE(a, b, { method })`. Tested: `"2000"` on Lab inputs. Other methods untested. [Color difference](https://colorjs.io/docs/color-difference).
- **Interpolation, ranges, contrast, string parsing and serialisation:** documented, untested. Start at the [docs index](https://colorjs.io/docs/).

## Install and doctor
```sh
npm install colorjs.io@0.7.1
```
A project dependency, not a machine executable; `vcr doctor` does not check it. From the project: `node -e 'import("colorjs.io").then(() => console.log("color-js: OK"))'`.

## Smoke test
```sh
pnpm install && examples/colorjs-conversions/run.sh
# expect: colorjs-conversions: OK
```
It runs the script twice in separate processes, requires identical output and diffs against `expected/metrics.json`. Recorded: 16 colours round-trip within 3.5e-14, 4 out-of-gamut OKLCH colours map into sRGB (largest lightness shift 0.0137), 8 Sharma pairs within 4.1e-5 of published.

## Recipes (tested)
```js
import Color from "colorjs.io";

const oklch = new Color("srgb", [1, 0.5, 0]).to("oklch");   // coords [L, C, H]
const back = oklch.to("srgb").coords;                         // channels on 0 to 1

const wide = new Color("oklch", [0.7, 0.4, 150]);
wide.inGamut("srgb");                                         // false
const safe = wide.toGamut({ space: "srgb", method: "css" });  // now in sRGB

const deltaE = Color.deltaE(new Color("lab", labA), new Color("lab", labB), { method: "2000" });
```
- sRGB channels are 0 to 1, not 0 to 255; divide hex bytes by 255.
- Achromatic colours (black, white, greys) come back from OKLCH with hue `null`, CSS "none". Guard it before doing arithmetic or serialising (`toPrecision` on it throws).
- Mapped sRGB channels can sit a hair outside the range (about 1e-14); clamp before quantising to 8 bits if exact bounds matter.
- Check `inGamut` before mapping rather than assuming; mapping changes lightness slightly, so re-read `L` if it matters.

## Troubleshooting
- `TypeError` on `.toPrecision` or NaN in hue maths: the hue is `null` for an achromatic colour; branch on it.
- Version assertion fails: the fixture pins `colorjs.io` 0.7.1 exactly; reinstall from the repository root.
- Output differs between runs: not seen in the fixture; other inputs are untested.

## Official docs
- [Color.js documentation](https://colorjs.io/docs/)
- [Repository](https://github.com/color-js/color.js)
- [0.7.1 on npm](https://www.npmjs.com/package/colorjs.io/v/0.7.1)
