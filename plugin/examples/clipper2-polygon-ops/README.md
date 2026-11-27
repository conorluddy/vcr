# Clipper2 union, offset and difference to SVG

## Intent and scope

- Tool/version: Clipper2 through `clipper2-wasm` 0.4.0 (BSL-1.0; bundled Clipper2 release not stated by the package).
- Claim: in plain Node, `UnionD`, `InflatePathsD` (round outset, miter inset) and `DifferenceD` on flattened polygons give clean rings with correct areas, written as SVG that is byte-identical across separate processes and rasterises through resvg.
- Exclusions: Minkowski sums, triangulation, open-path offsets (`EndType` other than Polygon), the integer `*64` API, browser use, large inputs, performance, and other WASM builds.
- Official documentation: https://github.com/PolyClipping/Clipper2 (successor of the archived AngusJohnson/Clipper2) and https://github.com/ErikSom/Clipper2-WASM; checked 2026-11-27.
- Environment: macOS 26.6 arm64; Node 22.19.0; resvg and ImageMagick for the size check.
- Input: a 5-point star (outer 80, inner 40), a 96-segment circle (centre 50,10, radius 55), a 180 square and a 96-segment circle of radius 60, all built in `render.mjs`.
- Output: ignored `output/` (`shapes.svg`, `shapes.png`, `facts.json`).

## Plan, before running

- Run `./run.sh --record`, then `./run.sh`.
- Assert: SVG hash identical across two `node render.mjs` processes; difference area within 1 of the analytic value (180² minus the 96-gon area of radius 60); difference has 2 rings and the union 1; outset area > union > inset; `facts.json` matches `expected/facts.json`; resvg at `--width 960` gives 960x300.
- Inspect the PNG at native size. Stop if the union has stray rings, the miter inset rounds off, or the hash differs between runs.

## Observation

Executed on 2026-11-27. Recording and verifying runs passed; SVG SHA-256 was identical across processes. The 960x300 PNG was inspected: the union outline wraps both shapes as one ring, the outset is rounded and evenly spaced, the inset keeps sharp miter points, and the difference is a square with a round hole. Areas: union 14727.39, outset 23298.37, inset 9531.12, difference 21098.5 (analytic 21098.6). This covers one machine, one version and a few small polygons; it does not cover other operations, scale or performance.
