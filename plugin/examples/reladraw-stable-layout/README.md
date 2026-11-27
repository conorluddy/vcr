# reladraw stable-layout fixture

## Intent and scope

- Tool: `reladraw` 0.32.1, installed locally by `pnpm add reladraw@0.32.1` in this example (no global install); bin run from `node_modules/.bin`.
- Claim: "reladraw renders a text diagram to SVG headlessly, and adding a node to the source leaves every existing node at identical coordinates, so successive versions can serve as diagram-build keyframes."
- Exclusions: other syntax (containers, curved or routed edges, themes), `serve`, `--page`, the web element, `install-skill`, diagram quality in general, other versions and platforms, and any edge to resvg or an animation tool. `resvg` only makes an inspection PNG.
- Sources: [repository](https://github.com/reladraw/reladraw), npm package; licence Apache-2.0 from `npm view reladraw license` and the packaged LICENSE (2026-11-27).
- Environment: macOS arm64 (Darwin 25.6.0), Node via pnpm 10.29.2.
- Input: fixture-authored `v1.reladraw` (Source, Layout, SVG; `right of`, gap 6) and `v2.reladraw` (v1 plus Inspect `below` SVG). No network at run time beyond the pnpm install.
- Side effects: `node_modules/` and ignored `output/` in this directory only.

## Plan, before running

- Commands: `reladraw --version`; `reladraw render v1|v2.reladraw -o output/*.svg`; render v2 twice and `cmp`; `reladraw check` both; `check-output.py` compares the SVGs.
- Predeclared checks:
  1. Version prints exactly `0.32.1`.
  2. Both SVGs parse and carry a `viewBox`; node labels are exactly {Source, Layout, SVG} and {Source, Layout, SVG, Inspect}.
  3. Arrow count is 2 in v1 and 3 in v2.
  4. Each of the three shared nodes has a byte-identical box path in v1 and v2 (unmoved).
  5. Two renders of v2 are byte-identical; SHA-256 and viewBox match `expected/metrics.json`.
  6. `reladraw check` exits 0 on both files.
- Stop conditions: any check fails, or the PNG shows overlap or clipping. A failed check stays and is reported as KNOWN FAIL.
- Inspect: `resvg -w 900 output/v2.svg output/v2.png`.

## Observation, after running

Pass, 2026-11-27, Conors-MacBook-Pro-2.local.

- Observed: v1 viewBox `0 0 436 127`, v2 `0 0 453 246`. The three shared nodes' paths are identical; the canvas grows to fit. Four boxes, three arrows. Repeat render byte-identical. `check` printed no warnings.
- Inspection: v2 PNG at 900 px shows Source, Layout, SVG in a row with arrows, Inspect below SVG joined by a vertical arrow; no overlap, clipping or illegible text. The font is a monospace stack (DejaVu Sans Mono, then Menlo), so glyph widths depend on the viewer's font.
- Deviations: the first draft used `gap: 40`, which drew about 480 px gaps; the gap value is scaled, so the fixture uses `gap: 6`. Not a check change.
- Establishes: for this chain, reladraw 0.32.1 renders deterministic SVG and an added node does not move existing ones. Does not establish: cross-host or cross-version determinism, larger diagrams, nodes whose size changes with label text (a longer label may shift neighbours placed relative to it), or animation.
