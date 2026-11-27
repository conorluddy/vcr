# svg-path-commander cubic normalisation for a path morph

## Intent and scope

- Tool/version: svg-path-commander 2.4.0 (npm, MIT).
- Claim: two paths written with different commands (H, A, L, Q; L, S, Q, H) become absolute cubic-only path data in Node with no DOM, so their control points can be paired and interpolated into SVG frames; the output is byte-identical across processes and rasterises through resvg.
- Exclusions: `getPointAtLength` sampling, `optimize`, `reverse`, 3D transforms, paths with different segment counts (pairing is the caller's job), multi-subpath shapes, and browser use.
- Official documentation: https://github.com/thednp/svg-path-commander (README); checked 2026-11-27.
- Environment: macOS arm64; Node 22.19.0; resvg and ImageMagick for rasterising and size checks.
- Input: two path strings in `render.mjs`; no external assets.
- Output: ignored `output/` (`frame-0..2.svg`, PNGs, `contact.png`, `facts.json`, `metrics.json`).

## Plan, before running

- Run `./run.sh --record`, then `./run.sh`.
- Assert: frame SVG hashes identical across two `node render.mjs` processes; both normalised paths contain only absolute M, C and Z with equal curve counts; a translate transform shifts the bounding box x by 5; resvg at `--width 260` gives 260x260 PNGs; metrics match `expected/metrics.json`.
- Inspect the contact sheet at native size. Stop if frames are not a smooth shape change between the two outlines.

## Observation

Recording and verifying runs both passed. Both shapes normalise to 6 cubics. The contact sheet shows a rounded-corner shape morphing through a midpoint into a trapezoid; the midpoint is a plausible blend and the outline is closed. Findings: my first pair of shapes normalised to 6 and 7 segments, and the library did not pair or split them, so the fixture throws on a mismatch. `toCurve()` mutates the instance, so `getTotalLength()` after it measures the cubic approximation (357.132) and differs from a fresh instance (357.128). Bounding boxes carry float noise (16.999999999999993), so facts are rounded. This covers one pair of paths on one machine; it does not cover sampling, optimisation or unequal segment counts.
