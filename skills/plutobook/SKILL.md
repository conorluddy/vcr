---
name: plutobook
description: Render HTML and CSS to PNG frames (or PDF) from Python with PlutoBook's plutoprint wheel, no browser. Load once PlutoBook has been chosen for title cards or text-heavy stills; it runs no JavaScript and paints no CSS gradients on the tested build.
---

# PlutoBook

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this file; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Write a page as an HTML string whose layout is a pure function of `t`, render one PNG per frame, and assemble with `ffmpeg`. Suits title cards and text-heavy stills.
- No JavaScript (an inline script did not run), no CSS gradients (linear and radial painted nothing). Anything needing either: `playwright`. JSX to SVG: `satori`.
- Unpainted areas are transparent in the PNG: always set a background colour.
- VCR evidence covers plutoprint 0.24.0 (PlutoBook 0.21.0), Python 3.12, macOS arm64: the recipe below. Everything else is untested.

## Capability map
| Area | Official reference | VCR |
| --- | --- | --- |
| `Book(page_size, margins)`, `load_html`, `write_to_png(path, width, height)` | [repository](https://github.com/plutoprint/plutobook) | tested |
| Flexbox, absolute positioning, border-radius, wrapped text, solid colours | repository | tested |
| `write_to_pdf`, paged media, `plutoprint` CLI (PDF) | repository | untested |
| `load_url`, `load_xml`, `load_image`, resource fetchers, web fonts, images in pages | repository | untested |
| CSS gradients, JavaScript | repository | not working on the tested build |

## Install and doctor
```sh
python3 -m venv output/venv && output/venv/bin/pip install plutoprint==0.24.0
```
Python 3.10 or later; the macOS arm64 wheel bundles the library, so no brew. A project-local venv: `vcr doctor` does not probe it. Never install it globally.

## Smoke test
```sh
cd examples/plutobook-html-png && ./run.sh
# expect: plutobook-html-png: OK
```
Runs `card.py` twice in separate processes, requires identical JSON (PNG hashes included), and diffs it against `expected/metrics.json`. The hashes are of this machine's fonts; on another machine re-record.

## Recipe
```py
import plutoprint
book = plutoprint.Book(plutoprint.PAGE_SIZE_NONE, plutoprint.PAGE_MARGINS_NONE)
book.load_html(f"<style>html,body{{margin:0;width:1920px;height:1080px;background:#0b1e3a}}</style>"
               f"<div style='position:absolute;left:{x}px'>...</div>")
book.write_to_png("frame.png", 1920, 1080)
```
A fresh `Book` per frame; frames rendered in shuffled order were byte-identical to sequential ones.

## Troubleshooting
- Transparent or white output: the background is unpainted, or you used a gradient. Use a solid colour.
- `plutoprint` CLI writes PDF only; use the Python API for PNG.
- `sans-serif` resolved to a DejaVu-like face here; set explicit font files if look matters across machines (untested).

## Official docs
- [PlutoBook repository](https://github.com/plutoprint/plutobook)
- [plutoprint on PyPI](https://pypi.org/project/plutoprint/)
