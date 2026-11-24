---
name: fonttools
description: Subset a font to a known codepoint set with pyftsubset, write TTF or WOFF2, and inspect cmap and glyph counts with fontTools. Load when a scene should ship a small font file for fixed text; variable-font instancing is documented but untested.
---

# fonttools

VCR evidence covers fonttools 4.68.0 with brotli 1.2.1 (Python 3.12.2) on macOS arm64: `pyftsubset` reduced OFL JetBrains Mono Bold (114828 B, 976 cmap codepoints, 1168 glyphs) to the 14 codepoints of `Type & Motion 2026`. Variable-font instancing is untested.

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Use it to cut a font to the glyphs fixed text needs and to read back what a font file covers (cmap, glyph count) from Python.
- Shown: TTF subset 3772 B (21 glyphs, cmap equals the 14 title codepoints), WOFF2 subset 1712 B (magic `wOF2`, cmap equal to the TTF). The 81 other printable ASCII codepoints in the source are absent. Two runs of each were byte-identical.
- An uncovered codepoint is not drawn as a missing-glyph box: it renders as blank space. Check the cmap against the text, not the picture.
- Not established: `varLib.instancer` (no OFL variable font in the repo), other fonts, OTF/WOFF/TTC, hinting or layout-feature options, browser loading, other platforms, or byte identity across fonttools or brotli versions (hashes change on a bump; cmap checks still hold).
- For shaping, ligatures and advances use harfbuzz. For final text rendering use the browser or renderer.
- Typography rules belong to the pillar: `TYPO-FONT-SHIP` (provisioning, bundling and licence travel with the font; record family, version, hash, source, licence), `TYPO-FONTS` (manifest) and `TYPO-FONT-READY` (browser loading, not exercised here); `vcr rules info <ID>`. No thresholds are taken from them.
- Licence: the OFL permits subsetting and redistribution, and the licence text must travel with the font (`fonts/OFL.txt`). Reserved Font Names may forbid reusing the original name on a modified font. Check the font's OFL header before renaming; the fixture does not rename and does not test this.

## Capability map
Documentation is discovery, not VCR validation.
- `pyftsubset`: subset by `--unicodes`, `--text`, `--glyphs`, layout features, hinting and name options, `--flavor=woff|woff2`. Tested: `--unicodes=<hex list>`, `--output-file`, `--flavor=woff2`, otherwise defaults. ([subset docs](https://fonttools.readthedocs.io/en/latest/subset/index.html))
- `fontTools.ttLib.TTFont`: read tables. Tested: `cmap` and glyph order. ([ttLib](https://fonttools.readthedocs.io/en/latest/ttLib/index.html))
- `fontTools.varLib.instancer` (also `fonttools varLib.instancer`): pin or limit variable axes to make a static or narrower font. Documented, untested. ([instancer](https://fonttools.readthedocs.io/en/latest/varLib/instancer.html))
- Other areas (`ttx` XML dump, `merge`, `varLib` building, `feaLib`, `pens`) are untested here. ([index](https://fonttools.readthedocs.io/en/latest/))

## Install and doctor
```sh
python3 -m venv examples/fonttools-subset-instance/output/venv
examples/fonttools-subset-instance/output/venv/bin/pip install -r examples/fonttools-subset-instance/requirements.txt
```
`requirements.txt` pins `fonttools==4.68.0` and `brotli==1.2.1`; WOFF2 output needs brotli. The venv is local and git-ignored; nothing is installed system-wide. The record's check command is `pyftsubset --version`; run `vcr doctor` for status. This guide does not claim the tool is installed.

## Smoke test
```sh
./examples/fonttools-subset-instance/run.sh
# expect: fonttools-subset-instance: OK
```
Run `./run.sh --record` only after inspecting a deliberate change; later runs diff against `expected/checks.json`.

## Recipes
```sh
PYFTSUBSET=examples/fonttools-subset-instance/output/venv/bin/pyftsubset
FONT=examples/fonttools-subset-instance/fonts/JetBrainsMono-Bold.ttf
UNICODES=$(python3 -c 'import sys; print(",".join(f"{ord(c):04X}" for c in sorted(set(sys.argv[1]))))' "Type & Motion 2026")
$PYFTSUBSET "$FONT" --unicodes="$UNICODES" --output-file=title.ttf
$PYFTSUBSET "$FONT" --unicodes="$UNICODES" --flavor=woff2 --output-file=title.woff2
```
- Derive the codepoint list from the exact scene string, so a copy edit that adds a letter is caught by a rebuild, not by a blank glyph.
- Assert the subset's cmap equals the string's codepoints, read via `TTFont(path)["cmap"].tables`; see `check.py`.
- Hash the font input and outputs into the font manifest. The recorded hashes hold for this pair of versions on this machine only.

## Troubleshooting
- WOFF2 fails or `--flavor=woff2` errors: brotli is missing from the venv; install the pinned `brotli`.
- Letters render blank: the codepoint was not in `--unicodes`. The subset does not draw a missing-glyph box.
- Output hash differs from `expected/`: compare `fonttools` and `brotli` versions and the input font hash first; reruns here were identical.

## Official docs
- [fonttools repository](https://github.com/fonttools/fonttools)
- [fonttools documentation](https://fonttools.readthedocs.io/en/latest/)
- [JetBrains Mono (OFL 1.1)](https://github.com/JetBrains/JetBrainsMono)
