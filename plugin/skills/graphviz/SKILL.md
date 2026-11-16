---
name: graphviz
description: Generate automatically laid out DOT diagrams through Graphviz's native CLI. Use when a graph or dependency map needs deterministic vector output from text input.
---

# Graphviz

`vcr` below means `pnpm vcr` inside this repository, or `node <plugin-root>/cli/vcr.mjs` from an installed plugin; run commands from the workspace.

Evidence: Graphviz 16.1.1 on macOS 26.6 arm64. The fixture renders one four-node directed DOT graph to SVG and checks topology, dimensions and byte-identical repeat output. Other layouts, formats, graph sizes and platforms are untested.

## Use cases and limits
- Use for graphs whose positions should come from a layout engine; use Mermaid CLI for simple flowcharts, or hand-authored SVG when each element needs designed placement.
- Evidence covers `dot` with one small graph and SVG output. It does not establish diagram quality for other inputs or Graphviz's other layout engines.

## Capability map
- DOT language: graph, node and edge declarations and attributes ([language reference](https://graphviz.org/doc/info/lang.html)).
- CLI: choose a layout executable or `-K` layout, output format with `-T`, and output path with `-o` ([command reference](https://graphviz.org/doc/info/command.html)).
- Output formats depend on the installed build and plugins ([format reference](https://graphviz.org/doc/info/output.html)).
- VCR exercised `dot -Tsvg`, four node labels, three directed edges and repeated output. PNG/PDF output, other layouts, advanced attributes, fonts and plugin configuration are documented but untested here.

## Install and doctor
```sh
brew install graphviz
vcr doctor
```
Confirm the CLI with `dot -V`; the evidence run used Graphviz 16.1.1. VCR does not claim the binary is installed on another machine.

## Smoke test
```sh
cd examples/graphviz-dot-svg && ./run.sh
# expect: graphviz-dot-svg: OK
```
This verifies the SVG structure and its byte-identical repeat for the fixture input; it does not validate arbitrary diagrams.

## Recipes
```sh
dot -Tsvg graph.dot -o graph.svg
dot -Kneato -Tsvg graph.dot -o graph.svg
```
The second command selects a different layout engine and is documented, not covered by the fixture.

## Troubleshooting
- `dot: command not found`: install Graphviz and check that its `bin` directory is on `PATH`.
- An output format is unavailable: inspect `dot -T:` for formats supported by this Graphviz build.
- Output hash changes: check the Graphviz version and input before replacing fixture expectations.

## Official docs
- [Command line](https://graphviz.org/doc/info/command.html)
- [DOT language](https://graphviz.org/doc/info/lang.html)
- [Output formats](https://graphviz.org/doc/info/output.html)
