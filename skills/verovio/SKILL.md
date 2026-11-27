---
name: verovio
description: Engrave MusicXML (also MEI, Humdrum, ABC) to SVG sheet music in-process with Verovio's Python module, with a timemap of note onsets, then rasterise with resvg. Load once Verovio has been chosen for a notation layer.
---

# Verovio

`vcr` below means `node <plugin-root>/cli/vcr.mjs`; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- One score in, one SVG page out. Noteheads, clefs and barlines are paths; titles, part names and lyrics are `<text>` in `Times, serif`, so they depend on installed fonts.
- Still output. Animation means using the SVG as a layer in a browser scene (`svg`, `anime-js`) and targeting `note` ids or classes (untested); `renderToTimemap()` gives onset times to drive it.
- Reading symbolic music without drawing: `music21`, `mido`. A BSD-licensed Node route: `opensheetmusicdisplay`. Simple bars or piano roll: `svg`.
- LGPL-3.0-only: check obligations before bundling it.
- VCR evidence covers one 4-bar MusicXML melody via the Python wheel on macOS arm64.

## Capability map
| Area | Official reference | VCR |
| --- | --- | --- |
| Toolkit: `loadFile`, `loadData`, `renderToSVG`, `setOptions` | [book](https://book.verovio.org) | tested |
| Timemap (`renderToTimemap`) | [book](https://book.verovio.org) | tested (note-on count only) |
| `xmlIdSeed`, page size, scale, `adjustPageHeight` | [options](https://book.verovio.org/toolkit-reference/toolkit-options.html) | tested |
| MEI, Humdrum, ABC, `.mxl` input | [book](https://book.verovio.org) | untested |
| MIDI export, multi-page, fonts, CLI, JS/WASM | [book](https://book.verovio.org) | untested |

## Install and doctor
```sh
python3 -m venv .venv && .venv/bin/pip install verovio==6.4.1
```
Project-local: `vcr doctor` does not probe it. The arm64 wheel installs without Homebrew.

## Smoke test
```sh
cd examples/verovio-musicxml-svg && python3 -m venv output/venv && output/venv/bin/pip install -r requirements.txt && ./run.sh
# expect: OK: verovio-musicxml-svg
```
Renders twice in separate processes, diffs counts and the SVG hash against `expected/metrics.json`, and checks an 1800x366 PNG.

## Recipe: MusicXML to SVG
```python
import verovio
tk = verovio.toolkit()
tk.setOptions({"pageWidth": 1800, "pageHeight": 700, "adjustPageHeight": True,
               "svgViewBox": True, "xmlIdSeed": 1})
assert tk.loadFile("score.musicxml"), tk.getLog()
svg = tk.renderToSVG(1)
```
```sh
resvg --width 1800 --background white score.svg score.png
```
- Set `xmlIdSeed`: otherwise ids are random and every run differs byte for byte.
- Scene hooks: `class="measure"`, `note`, `notehead`; a rest is not a `note`.

## Troubleshooting
- Different SVG hash on every run: set `xmlIdSeed`.
- Title clipped at the left in resvg: Verovio puts `text-anchor="middle"` on a nested `<tspan>`; resvg mis-places it. Browser rendering untested; crop or omit the title if it matters.
- `loadFile` returns false: read `tk.getLog()`.

## Official docs
- [Verovio book](https://book.verovio.org)
- [Repository](https://github.com/rism-digital/verovio)
- [PyPI](https://pypi.org/project/verovio/)
