---
name: pikchr
description: Turn a Pikchr script (boxes and arrows placed by direction and distance) into SVG with a locally built pikchr binary, then rasterise with resvg. Load once Pikchr has been chosen for a diagram whose layout must stay exactly where the script puts it.
---

# Pikchr

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this file; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- One script in, one SVG out, placed by relative direction and distance. Changing one element moves only what depends on it (tested: a longer last label left the first five shapes byte-identical).
- It is a still. To animate steps, split the SVG into layers in a browser scene (`svg`, `anime-js`). For automatic layout of larger graphs use `graphviz` or `d2`; for Markdown-style flowcharts `mermaid-cli`.
- VCR evidence covers one four-box flow with arrows and labels, pikchr 1.0 built from source on macOS arm64. Everything else below is marked untested.

## Capability map
| Area | Official reference | VCR |
| --- | --- | --- |
| `box`, `arrow`, labels, `fit`, `linewid` | [user manual](https://pikchr.org/home/doc/trunk/doc/userman.md) | tested |
| Other objects (circle, cylinder, spline, file), `behind`, `chop`, colour expressions | [doc index](https://pikchr.org/home/doc/trunk/homepage.md) | untested |
| Grammar and language reference | [grammar](https://pikchr.org/home/doc/trunk/doc/grammar.md) | untested |
| `--svg-only`, `--dark-mode` CLI flags | `pikchr` usage text | `--svg-only` tested; `--dark-mode` untested |
| WASM fiddle build, library use (`pikchr.h`) | [build](https://pikchr.org/home/doc/trunk/doc/build.md) | untested |

## Install and doctor
There is no release, package or Homebrew formula, and the repository does not commit `pikchr.c`. Build the pinned check-in with the system C compiler, inside the example's ignored `output/`, not onto `PATH`:
```sh
cd examples/pikchr-flow-svg && ./run.sh   # downloads, verifies pikchr.y, runs the official `make pikchr`
```
`vcr doctor` does not probe it. The version is the check-in: `pikchr 1.0 20260403102956` is Fossil `a7f1c35bc0`.

## Smoke test
```sh
cd examples/pikchr-flow-svg && ./run.sh
# expect: OK: pikchr-flow-svg
```
Renders twice and requires identical bytes, checks 7 paths and the four labels, edits the last label and requires the earlier shapes unchanged, then rasterises through resvg (960x68). The first run needs network; later runs reuse `output/src`.

## Recipe: script to SVG to PNG
```pikchr
linewid = 0.6in
A: box "Script" fit
arrow
B: box "Parse" fit
```
```sh
output/src/pikchr --svg-only flow.pikchr > flow.svg
resvg --width 960 --background white flow.svg flow.png
```
- `--svg-only` drops the HTML wrapper; without it the output is an HTML fragment.
- Shapes are `<path>`, labels are `<text>`, arrowheads `<polygon>`. Size is the viewBox; derive the raster height from it.

## Fonts
The SVG has no `font-family` and sets `font-size:initial` on the root. resvg 0.47.0 prints `Invalid 'font-size' value: 'initial'` per label but still draws readable serif text. For a fixed look, set the font on the rasteriser (resvg font options) or add `font-family` yourself before placing the SVG in a scene; both untested.

## Troubleshooting
- `FAIL: pikchr.y differs from pinned check-in`: the tarball changed; do not proceed, re-pin deliberately with `expected/pikchr.y.sha256`.
- A tarball request returning HTML means the check-in hash is wrong; only the tarball route worked (the `raw` and `doc` routes for `pikchr.c` return pages, not source).

## Official docs
- [Pikchr home](https://pikchr.org)
- [User manual](https://pikchr.org/home/doc/trunk/doc/userman.md)
- [Mirror](https://github.com/drhsqlite/pikchr)
