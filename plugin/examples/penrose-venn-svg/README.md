# Penrose trio to deterministic SVG

## Intent and scope

- Tool/version: `@penrose/core` 3.3.1 (MIT) with `jsdom` 22.1.0 and `global-jsdom` 8.8.0 as the DOM it needs. The `@penrose/roger` CLI was not used: the lead's global install is a machine install, and roger only wraps core with these same two packages plus native `canvas`.
- Claim: a Domain, Substance and Style trio (three sets, two overlapping pairs and one disjoint pair) compiles and optimises in Node with a fixed variation string to an SVG that is byte-identical across separate processes. A different variation string gives different bytes, and its layout still meets the same constraints.
- Exclusions: other shapes, Style features and the `.trio.json` and registry-import routes; `Text` shapes (need native `canvas`); `texLabels: true`; animation or interpolating layouts; other Node or Penrose versions; other machines (floating-point optimiser).
- Official documentation: https://penrose.cs.cmu.edu/docs/ref/ and https://github.com/penrose/penrose; checked 2026-11-27.
- Environment: macOS 26.6 arm64; Node 22.19.0; resvg and ImageMagick for the raster check.
- Input: the trio strings in `render.mjs`; no external assets.
- Output: ignored `output/` (`venn.svg`, `venn-other.svg`, `venn.png`, `metrics.json`).

## Plan, before running

- Run `./run.sh --record`, then `./run.sh`.
- Assert: two `node render.mjs` processes with the same variation give identical SHA-256; a second variation gives a different hash; in both, three circles, A and B overlap, B and C overlap, A and C are disjoint (centre distance versus radii); no `<text>` elements (labels are MathJax path outlines); resvg at `--width 800` gives an 800x600 PNG; metrics match `expected/metrics.json`.
- Inspect the PNG. Stop and report if the hash differs between processes, or a constraint fails. Do not loosen a check to pass.

## Observation

Executed 2026-11-27 on `Conors-MacBook-Pro-2.local`. Both runs passed. Fixed-variation SVG SHA-256 `bd6fc945…91c5`, 3892 bytes, 3 circles, 3 label paths, 0 `<text>`. The second variation produced a visibly different arrangement (the chain runs C-B-A the other way) with the constraints met. Inspected both rasters: labels set as italic maths, overlaps and the disjoint pair read correctly. Findings: `compile` fails in plain Node with `window is not defined` (core's MathJax uses `browserAdaptor`), so a jsdom global is required; `toSVG(..., texLabels=true)` emits raw `$A$` text, so leave it false for self-contained output. This does not establish determinism across machines, Node versions or richer diagrams.
