---
name: opentype-js
description: Parse OpenType and TrueType fonts in JavaScript and read glyph metrics or outlines. Load when font-file geometry is needed in a Node or browser workflow.
---

# OpenType.js

VCR evidence covers OpenType.js 2.0.0 on Node 25.6.1/macOS 26.6 arm64: parse an owned one-glyph TTF and inspect its family, units per em, glyph index, advance width, and outline commands. Shaping, variable fonts, WOFF, and complex scripts remain untested.

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Use OpenType.js when a JS process needs font metadata or glyph paths that can be converted to SVG or canvas geometry.
- The fixture parses one generated TrueType font and reads glyph `A`. It does not establish shaping, kerning, WOFF, collections, variable-font behavior, complex scripts, or cross-platform rendering.
- For font atlas textures, use msdfgen; for text layout and shaping, select a shaping engine and validate it separately.

## Capability map
- Font loading and parsing expose `parse`/`load` and a `Font` with names, metrics, glyphs, and tables. VCR exercises `parse` on a generated TTF and reads only family and units-per-em ([official API guide](https://opentype.js.org/), [project README](https://github.com/opentypejs/opentype.js)).
- Glyph operations include character-to-glyph lookup, advance metrics, and path extraction; the fixture exercises `charToGlyph`, `advanceWidth`, and `getPath` command data. Other glyph APIs remain untested.
- The library also documents text-path creation and font writing; neither is covered by this fixture. Documentation is an API map, not VCR validation.

## Install and doctor
```sh
pnpm add opentype.js@2.0.0
pnpm list opentype.js --depth 0
```
This is a project-local JavaScript dependency, not a machine executable; `vcr doctor` does not probe it. The guide does not claim it is installed.

## Smoke test
```sh
./examples/opentype-js-generated/run.sh
# expect: OK: opentype-js-generated
```
The fixture generates its own one-glyph font, parses it twice, and compares exact metrics and path commands. It uses FontTools 4.68.0 to create the test input; no external font asset is needed.

## Troubleshooting
- If the parser rejects the fixture font, first confirm `./run.sh` completed its locked FontTools setup and created `output/fixture.ttf`.
- If parsed values differ, inspect the generated TTF and `output/metrics.json`; the expected result depends on the fixture's explicit glyph order and metrics.

## Official docs
- [OpenType.js 2.0.0 repository](https://github.com/opentypejs/opentype.js/tree/v2.0.0)
- [API documentation](https://opentype.js.org/)
- [Project README](https://github.com/opentypejs/opentype.js/blob/master/README.md)
