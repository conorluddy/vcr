# msdfgen SVG to MSDF

## Intent and scope

- Tool: msdfgen CLI 1.13.1.
- Claim: generate a 64×64 RGB multi-channel signed distance field from the final path in an owned SVG.
- Exclusions: font loading, atlases, arbitrary SVG elements, glyph metrics, shader sampling quality, and other platforms/builds.
- Source: https://github.com/Chlumsky/msdfgen (MIT); checked 2026-11-15. `-svg` reads the last vector path in the SVG.
- Environment: macOS 26.6 arm64; Homebrew msdfgen 1.13.1; ImageMagick 7.1.2-15 for inspection.
- Input: authored `source.svg`, a single closed path; no external assets.
- Install: Homebrew `brew install msdfgen`; installed 1.13.1 and tinyxml2 11.0.0.
- Output and cache: `output/` (ignored); no user configuration needed.

## Plan, before running

- Run `msdfgen msdf -svg source.svg -o output/field.png -dimensions 64 64 -pxrange 4 -autoframe -testrender output/render.png 256 256` twice.
- Assert exact CLI version, 64×64 RGB field, nonuniform pixel data, valid 256×256 test render, and identical field hashes across runs.
- Inspect the 256×256 test render. Stop if SVG input is unsupported or if the field is blank/constant.
- Reproduce with `./run.sh`; expected measurements live in `expected/metrics.json`.

## Observation

- **Date:** 2026-11-16.
- **Result:** msdfgen v1.13.1 generated a 64×64 sRGB distance field from the authored SVG path. The field had nonconstant channel values; its hash matched the recorded expected output. `-testrender` produced a 256×256 grayscale triangle, inspected visually.
- **Reproduction:** `./run.sh` regenerates both outputs and checks dimensions, channels, version, and field hash.
- **Limits:** this confirms SVG path input and one field generation only; it does not establish font parsing, atlas generation, shader sampling quality, or behavior of other builds.
