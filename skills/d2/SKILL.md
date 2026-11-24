---
name: d2
description: Generate text-defined diagrams with the D2 CLI and export SVG. Use when an editable, automatically laid out architecture or flow diagram is needed as vector output.
---

# D2

`vcr` below means `pnpm vcr` inside this repository, or `node <plugin-root>/cli/vcr.mjs` from an installed plugin; run commands from the workspace.

Evidence: D2 0.7.1 on macOS 26.6 arm64, default `dagre` layout, theme 0. The fixture renders one four-node left-to-right chain to SVG and checks labels, shape and edge counts and byte-identical repeat output. Other layouts, themes, formats, graph sizes and platforms are untested.

## Use cases and limits
- Use for flow or architecture diagrams whose layout should come from the engine and whose source should stay short and editable. Use Graphviz for DOT compatibility, Mermaid CLI for Markdown-style flowcharts, or hand-authored SVG for designed placement.
- Evidence covers `d2 in.d2 out.svg` with four labelled nodes, three directed edges and `direction: right`. It does not establish quality for other inputs.

## Capability map
- D2 language: shapes, connections, containers, styles, `direction` ([docs](https://d2lang.com/tour/intro)). Tested: plain labelled nodes, `->` edges, `direction: right`. Containers, styles, icons, classes and other keywords are documented, untested.
- CLI: `d2 [flags] input.d2 [output]`; output format follows the extension ([CLI reference](https://d2lang.com/tour/man)). Tested: `.svg` only. PNG, PDF, PPTX and GIF are documented, untested here.
- Layout engines: `dagre` (default, tested), `elk` and others via `--layout` ([layouts](https://d2lang.com/tour/layouts)); untested.
- Themes and `--sketch` mode ([themes](https://d2lang.com/tour/themes)); untested.
- SVG embeds the default font (`--bundle`, default on); this is part of the hashed output.

## Install and doctor
```sh
brew install d2
vcr doctor
```
Confirm with `d2 --version`; the evidence run printed `0.7.1`. VCR does not claim the binary is installed on another machine.

## Smoke test
```sh
cd examples/d2-diagram-svg && ./run.sh
# expect: d2-diagram-svg: OK
```
The run renders `source.d2` twice, requires the SVGs to be byte-identical, and diffs metrics against `expected/metrics.json` (12650 bytes, viewBox `0 0 859 268`, 4 shape groups, 3 connection paths, labels Source, Layout, SVG, Inspect).

## Recipes
```d2
direction: right
source: Source
layout: Layout
source -> layout
```
```sh
d2 source.d2 out.svg
```
Observed SVG markup: root `svg` has a `viewBox` only (no `width`/`height`); nodes are `g.shape`, edges are `path.connection`. Check output by parsing these, not by assuming `g.connection`.

## Troubleshooting
- `d2: command not found`: install D2 and check `PATH`.
- Hash differs from `expected/metrics.json`: check `d2 --version` and `source.d2` first; determinism was seen on one host and one version only.
- Parser expecting `width`/`height` or `g.connection` fails: use the markup above.

## Official docs
- [D2 documentation](https://d2lang.com)
- [Repository](https://github.com/terrastruct/d2)
