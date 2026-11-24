---
name: typst
description: Compile a Typst source file with the typst CLI to SVG or PNG for typeset stills such as data-driven title cards. Use when text layout from a source file and JSON data is wanted as vector or alpha raster output; note SVG glyphs are outlines.
---

# Typst

`vcr` below means `pnpm vcr` inside this repository, or `node <plugin-root>/cli/vcr.mjs` from an installed plugin; run commands from the workspace.

Evidence (partial): typst 0.15.1 on macOS 26.6 arm64. The fixture compiles one 640 x 360 pt title card (heading plus a value read with `json()`) to SVG and to PNG at `--ppi 144`, with one OFL font passed through `--font-path` and `--ignore-system-fonts`. Checked: PNG size and alpha, query result, byte-identical reruns, JSON-driven change. The SVG does not contain the value as text. PDF, HTML, packages, multi-page and other platforms are untested.

## Use cases and limits
- Use for typeset stills where layout, data from JSON and a pinned font matter. Use hand-authored SVG for exact element-level control, `resvg` to rasterise existing SVG, Satori for HTML/CSS-like layout.
- SVG output turns glyphs into outlines (`<use xlink:href="#g...">`, no `<text>`). The SVG is not searchable or selectable, and a string search of it will not find your data. Verify content from the source or from `typst eval`, not from the SVG.
- Reruns on this host are byte-identical; do not expect equal hashes across typst versions or platforms.

## Capability map
- Compile: `typst compile in.typ out.svg|png|pdf|html` ([CLI](https://typst.app/docs/reference/)). Tested: SVG and PNG with `--ppi`. PDF and HTML are documented, untested.
- Data loading: `json()`, also `csv()`, `yaml()`, `read()` ([data loading](https://typst.app/docs/reference/data-loading/)). Tested: `json()` only.
- Page and text setup: `#set page(width, height, margin, fill)`, `#set text(font, size, weight)`. Tested as in the fixture.
- Introspection: `typst query` (deprecated in 0.15.1; its hint points to `typst eval 'query(heading)'`) and `typst eval`. Tested: `query` only; `eval` untested.
- Fonts: `typst fonts`, `--font-path`, `--ignore-system-fonts`, `--ignore-embedded-fonts`. Tested: first two flags and `typst fonts`; `--ignore-embedded-fonts` untested.
- Equations, tables, figures, packages (`#import "@preview/..."`), multi-page documents: documented, untested. Packages and fonts can carry separate licences.

## Install and doctor
```sh
brew install typst
vcr doctor
```
Confirm with `typst --version`; the evidence run printed `typst 0.15.1`. VCR does not claim the binary is installed on another machine.

## Smoke test
```sh
cd examples/typst-title-card && ./run.sh
# expect: typst-title-card: predeclared checks failed
```
This is the recorded partial result, not a fault: 11 of 12 checks pass and it exits 1 because `svg_contains_value_as_text` is false (outlined glyphs). The diff against `expected/metrics.json` is empty when hashes reproduce. Recorded sample: SVG 19,796 bytes, viewBox `0 0 640 360`; PNG 1280 x 720 RGBA 8-bit, alpha 0..255.

## Font provisioning
Pin the face so output does not depend on the machine (`TYPO-FONT-SHIP`, `TYPO-FONTS`): ship the font file with its licence (the fixture keeps `fonts/` with `OFL.txt`) and pass the flags on every call, including `typst fonts`.
```sh
FONT_ARGS=(--font-path "$PWD/fonts" --ignore-system-fonts)
typst fonts "${FONT_ARGS[@]}"      # confirm the family is listed
typst compile "${FONT_ARGS[@]}" title.typ out.svg
typst compile "${FONT_ARGS[@]}" --ppi 144 title.typ out.png
```
`--ignore-system-fonts` does not remove typst's built-in faces (DejaVu Sans Mono, Libertinus Serif, New Computer Modern and Math); they stay available unless `--ignore-embedded-fonts` is also passed (untested). Name the font explicitly in `#set text(font: ...)` and look at the output: a missing family falls back silently. Record family, version, hash, source and licence in the font manifest.

## Recipes
Page size is in points; PNG pixels = pt x ppi / 72, so 640 x 360 pt at 144 ppi is 1280 x 720 px. A transparent page needs `fill: none`.
```typ
#set page(width: 640pt, height: 360pt, margin: 48pt, fill: none)
#set text(font: "JetBrains Mono", weight: "bold", size: 14pt)
#let data = json("data.json")
#heading(level: 1)[Kestrel Survey Summary]
#text(size: 56pt)[#data.value]
```
Check data and structure without the SVG:
```sh
typst query "${FONT_ARGS[@]}" title.typ heading   # deprecated; warning on stderr
typst eval  "${FONT_ARGS[@]}" 'query(heading)'    # replacement, untested here
```
`typst query` returned a one-element array (`func` heading, body "Kestrel Survey Summary"). Changing only `data.json` changed the SVG hash.

## Troubleshooting
- Value string missing from the SVG: expected, glyphs are outlines. Check the JSON or the source instead; no CLI option kept text as text in 0.15.1.
- `typst query` prints a deprecation warning: use `typst eval`.
- Wrong face in the output: check `typst fonts` with the same flags and the exact family name; remember built-in faces remain listed.
- Hash differs from `expected/metrics.json`: check `typst --version` first.

## Official docs
- [Typst documentation](https://typst.app/docs/)
- [Repository and README](https://github.com/typst/typst)
