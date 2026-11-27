---
name: reladraw
description: Draw diagrams from a text file where the author states placement (right of, below, gap) with the reladraw CLI and export SVG. Use when diagram nodes must stay put between versions, for example diagram-build animation.
---

# reladraw

`vcr` below means `pnpm vcr` inside this repository, or `node <plugin-root>/cli/vcr.mjs` from an installed plugin.

Evidence: reladraw 0.32.1 on macOS arm64, installed locally with `pnpm add reladraw@0.32.1` (no global install). The fixture renders a three-node chain and the same chain plus one node, and checks the original nodes keep identical coordinates. Other syntax, larger graphs and other versions are untested. The README warns the syntax changes often: pin the version.

## Use cases and limits
- Use when you decide where things go and edits must not shuffle the rest of the picture. Use D2 or Graphviz when automatic layout is wanted, Mermaid CLI for Markdown flowcharts.
- It never moves a box or routes around one; overlaps are drawn and reported as warnings. Run `check` and fix the source.
- Fixture claim: adding a node leaves existing nodes' box paths identical; the canvas (`viewBox`) grows to fit.

## Capability map
- `render in.reladraw -o out.svg`: SVG; tested. `--page` (single HTML page) is documented, untested.
- `check`: prints findings without writing; tested (no warnings on the fixture).
- `format`, `serve`, `note`, `install-skill`: documented ([README](https://github.com/reladraw/reladraw#readme)); untested. `install-skill` writes to `~/.claude/skills`, so VCR does not run it.
- Language: [SYNTAX.md](https://github.com/reladraw/reladraw/blob/main/SYNTAX.md). Tested: `node id "Label"`, `right of`, `below`, `(gap: N)`, `edge a -> b`. Containers, edge bends, labels and themes are untested.
- Web element `<reladraw-diagram>`: documented, untested.

## Install and doctor
```sh
pnpm add reladraw@0.32.1      # in the project that renders, not -g
./node_modules/.bin/reladraw --version   # 0.32.1
vcr doctor
```
VCR does not claim it is installed anywhere else.

## Smoke test
```sh
cd examples/reladraw-stable-layout && ./run.sh
# expect: reladraw-stable-layout: OK
```
It checks labels, arrow counts, that Source, Layout and SVG are unmoved between v1 and v2, a byte-identical repeat render, and metrics in `expected/metrics.json` (v1 viewBox `0 0 436 127`, v2 `0 0 453 246`).

## Recipe
```
node source "Source"
node layout "Layout"  right of source (gap: 6)
node render "SVG"     right of layout (gap: 6)
node inspect "Inspect"  below render (gap: 6)
edge source -> layout
edge layout -> render
edge render -> inspect
```
```sh
./node_modules/.bin/reladraw render diagram.reladraw -o diagram.svg
```
Observed markup: node boxes are rounded-rect `path` elements each followed by a `text`; edges are `line` elements with `marker-end`. The `gap` number is scaled, so check the picture: 40 drew a gap of about 480 px, 6 a gap of about 72. The font is a monospace stack, so widths depend on the viewer's installed font; rasterise with `resvg` to inspect.

## Troubleshooting
- Gaps far larger than expected: `gap` is scaled; lower the number.
- Warnings on render: a line crosses a box or texts overlap; edit the placement, reladraw will not reflow.
- Syntax error after an upgrade: the language changes between releases; keep the pinned version.
- Untested: a longer label may change a box width and move neighbours placed relative to it.

## Official docs
- [Repository and README](https://github.com/reladraw/reladraw)
- [SYNTAX.md](https://github.com/reladraw/reladraw/blob/main/SYNTAX.md)
