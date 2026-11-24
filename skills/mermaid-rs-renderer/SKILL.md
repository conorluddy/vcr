---
name: mermaid-rs-renderer
description: Render Mermaid text diagrams to SVG or PNG with the native Rust mmdr binary, no browser. Load when a fast, repeatable, browser-free Mermaid render is wanted; stay with mermaid-cli for full Mermaid theme and feature fidelity.
---

# mermaid-rs-renderer (mmdr)

VCR evidence covers crate `mermaid-rs-renderer` 0.3.1 (binary `mmdr`) rendering one small flowchart to SVG and PNG on macOS arm64 (cargo 1.95.0). Other diagram types, themes and configuration are untested.

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Use `mmdr` when a Mermaid diagram should render in about 20 ms with no browser, and the SVG must be byte-identical across reruns. The binary links only `libSystem` and `libiconv`.
- Evidence: one flowchart (4 nodes, 4 edges, 6 labels) gave the same labels and counts as `mmdc` 12.0.0; two SVG renders were byte-identical; PNG via `-e png` was 466x189 against `--size` 465.94x189.21 (within 1 px). Wall-clock medians were about 20-27 ms for `mmdr` against 1.5-2.4 s for `mmdc` (facts, not a gate).
- Stay with `mermaid-cli` when you need full Mermaid syntax coverage, themes or Mermaid config. Fidelity beyond label and count equality on this one diagram is untested; the look is lighter than the `mmdc` default theme (small, light node fill).
- For measured node and edge geometry, use D3 or Graphviz; for hand-composed vector artwork, use SVG.

## Capability map
Discoverability only; not VCR-validated unless marked.
- Diagram types: the crate advertises 23 Mermaid types ([README](https://github.com/1jehuang/mermaid-rs-renderer)). Tested: one flowchart.
- Output: SVG (default) and PNG via `-e png` (resvg inside mmdr). Tested: both, `-i`/`-o`. Untested: other flags, `--fastText`, themes, layout and spacing options, Markdown input.
- `--size` prints the rendered dimensions as JSON (tested); `--timing` prints per-phase timing JSON to stderr (observed once: ~22 ms total).
- Library use from Rust is documented upstream; untested.

## Install and doctor
```sh
cargo install --locked --root <dir> mermaid-rs-renderer@0.3.1   # ~1.5 min build
<dir>/bin/mmdr --version   # expect: mmdr 0.3.1
```
The fixture installs into the git-ignored `examples/mermaid-rs-renderer-svg/output/cargo/`, not `~/.cargo/bin`. The crate name differs from the binary name. `vcr doctor` does not record this tool; check the binary yourself.

## Smoke test
```sh
./examples/mermaid-rs-renderer-svg/run.sh
# expect: OK: mmdr SVG and PNG checks, repeat bytes and mmdc comparison match expected/result.json
```
The runner also renders with a pinned `mmdc` (needs `npm ci` in the example and the VCR Chromium) and prints timings, which vary by run.

## Render recipes
```sh
mmdr -i source.mmd -o out.svg
mmdr -i source.mmd -e png -o out.png
mmdr --size -i source.mmd      # dimensions as JSON
```

## Parsing the SVG
mmdr markup differs from mmdc by design: no `class="node"` groups and no HTML labels. In the tested output each node is an untagged `<g transform>` holding exactly one shape (`rect`, `polygon`, `path`, `circle` or `ellipse`); label `<text>` elements are siblings outside that group; edges are `path` elements with class token `edgePath`. Root `width` and `viewBox` are present. Do not reuse mmdc selectors; verify on your own diagram, since other diagram types are untested.

## Troubleshooting
- `mmdr: command not found`: the crate installs `mmdr`, not `mermaid-rs-renderer`; call `<root>/bin/mmdr`.
- A node counter finds 0 nodes: it was written for `class="node"`. Use the structural rule above.
- Text looks different elsewhere: PNG text uses machine fonts; not tested across machines.

## Official docs
- [mermaid-rs-renderer repository](https://github.com/1jehuang/mermaid-rs-renderer)
- [crates.io 0.3.1](https://crates.io/crates/mermaid-rs-renderer/0.3.1)
- [Mermaid syntax reference](https://mermaid.js.org/intro/syntax-reference.html)
