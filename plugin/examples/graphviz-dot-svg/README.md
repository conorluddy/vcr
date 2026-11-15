# Graphviz DOT-to-SVG fixture

## Intent and scope

- Tool ID and version/build: Graphviz `dot` 16.1.1.
- VCR job and exact claim being tested: render one authored directed DOT graph to SVG; preserve the declared node labels and edge topology in structurally valid SVG; produce identical output on repetition for the same version and host.
- Explicit exclusions: other layout engines, other output formats, graph sizes, typography fidelity, cross-version or cross-platform determinism, diagram quality in general, and any Graphviz-to-SVGO edge.
- Tool documentation and licence sources, checked 2026-11-15: [Graphviz command line](https://www.graphviz.org/doc/info/command.html), [DOT language](https://graphviz.org/doc/info/lang.html). The record identifies the project licence as EPL-1.0; no additional assets or models are used.
- Environment: macOS 26.6 arm64; Graphviz 16.1.1; visual-inspection helper `resvg` 0.47.0.
- Input: fixture-authored `source.dot`, containing four labeled nodes and three directed edges; no external assets.
- Dependencies, installation plan, permissions, network and expected side effects: Graphviz is already installed at `/opt/homebrew/bin/dot`; no installation or network required. Output is written under ignored `output/`. `resvg` is only a visual inspection helper and is not part of the Graphviz claim.
- Selected workspace, generated output and cleanup paths: this example directory; generated SVG and inspection PNG under `output/`.

## Plan, before running

- Exact commands: `dot -Tsvg source.dot -o output/graph.svg`; repeat to `output/graph-repeat.svg`; compare the SVG bytes.
- Expected artifacts and predeclared checks: parse SVG as XML; assert four node groups with expected labels, three edge groups with expected directed topology, a non-empty SVG viewBox, identical repeated output, and output SHA-256/byte count. Record `dot -V` exactly.
- Intended consumer and handoff settings: SVG output for downstream vector use. Rasterise a temporary inspection copy with resvg at 960 px wide to visually inspect the graph; this does not validate resvg or a cross-tool edge.
- Delivery constraints and units: SVG only; no media retained in `expected/`.
- Expected failure modes and stop conditions: Graphviz version differs from the observed version, malformed SVG, changed node/edge counts or labels, empty dimensions/viewBox, output mismatch on repetition, or visual clipping/overlap stops the fixture.
- Reproduction instructions: `./run.sh --record` records the baseline after inspection; `./run.sh` repeats and diffs all declared checks.

## Observation, after running

Pass on 2026-11-15: Graphviz 16.1.1 generated a 3,436-byte SVG from the owned DOT input. XML parsing found all four expected node titles and all three directed edge titles; the SVG viewBox was `0.00 0.00 366.00 65.00`; two runs produced byte-identical SVG and the expected SHA-256. Raster inspection with resvg 0.47.0 showed all four labeled boxes and arrows visible without clipping. This does not establish quality or stability for other graphs, layouts, formats, versions or platforms.
