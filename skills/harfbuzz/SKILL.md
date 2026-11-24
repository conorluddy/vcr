---
name: harfbuzz
description: Shape a string with a font using HarfBuzz hb-shape and render shaped text to SVG with hb-view. Load when glyph IDs, clusters, advances or ligature formation need checking outside the browser.
---

# HarfBuzz utilities

VCR evidence covers `hb-shape` and `hb-view` 15.1.0 (Homebrew) on macOS arm64: one fixed string, `a -> b != c`, shaped with one OFL monospace font (JetBrains Mono Bold), JSON and SVG output repeating byte for byte. Kerning, other fonts, other scripts, variations and `hb-subset` are untested.

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Use it as shaping ground truth: what glyphs, clusters and advances an engine produces for text plus a font, and a standalone SVG still of that shaped run.
- The fixture shows 11 glyphs for 11 characters, with `hyphen_greater.liga` at cluster 3 and `exclam_equal.liga` at cluster 8, every advance 600 font units. The two `SPC` glyphs beside each ligature keep monospace cells aligned.
- Not established: kerning (a monospace face never exercises it), other scripts, features, variable fonts, other HarfBuzz versions or platforms.
- For final scene text use the browser or renderer; for subsetting and instancing use fonttools. Font choice, shipping and loading rules belong to the typography pillar: see `TYPO-FONTS`, `TYPO-FONT-SHIP` and `TYPO-FONT-READY` (`vcr rules info <ID>`).

## Capability map
- `hb-shape`: text and font to glyph IDs, names, clusters, advances, offsets; text, JSON and other output formats, `--features`, `--variations`, script/language/direction flags. Tested: `--output-format=json`, with and without `--no-glyph-names`, default features. Others untested. ([utilities docs](https://harfbuzz.github.io/utilities.html))
- `hb-view`: renders shaped text via cairo to SVG, PNG, PDF and others. Tested: `--output-format=svg --font-size=96 -o`. Other formats untested.
- `hb-subset`, `hb-info`: documented in the same utilities page; untested here.
- The C library API ([manual](https://harfbuzz.github.io/)) is not used. Documentation is discovery, not VCR validation.

## Install and doctor
```sh
brew install harfbuzz
hb-shape --version
```
The record's check command is `hb-shape --version`; run `vcr doctor` for status. This guide does not claim the tool is installed.

## Smoke test
```sh
./examples/harfbuzz-shape-text/run.sh
# expect: harfbuzz-shape-text: OK
```
First record with `./run.sh --record` after inspecting the result; later runs diff against `expected/`.

## Recipes
```sh
FONT=examples/harfbuzz-shape-text/fonts/JetBrainsMono-Bold.ttf
hb-shape --output-format=json --no-glyph-names "$FONT" 'a -> b != c'   # glyph IDs, stable to diff
hb-shape --output-format=json "$FONT" 'a -> b != c'                    # glyph names, shows .liga
hb-view --output-format=svg --font-size=96 "$FONT" 'a -> b != c' -o view.svg
```
- Assert ligature formation by glyph name at the expected cluster, not by glyph count alone.
- The recorded SVG hash (`ff74b181...`) holds only for this build, this font file (SHA-256 `a2349098...`) and this host; a version check fails first on upgrade.
- The SVG has no background; flatten it onto a colour to view it. Rasterising is a human check, not part of the claim.

## Troubleshooting
- No `.liga` glyph where expected: the font file or feature path changed; check the font hash and HarfBuzz version first.
- SVG hash differs: confirm both tools report 15.1.0 and the font bytes are unchanged before suspecting nondeterminism (two runs here were identical).

## Official docs
- [HarfBuzz repository](https://github.com/harfbuzz/harfbuzz)
- [Utilities (hb-shape, hb-view, hb-subset)](https://harfbuzz.github.io/utilities.html)
