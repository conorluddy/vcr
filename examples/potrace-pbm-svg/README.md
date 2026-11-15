# Potrace PBM to SVG

## Intent and scope

- Tool/version: Potrace 1.16.
- Claim: trace one generated 25×25 binary PBM diamond ring to a tight SVG with one path containing outer and inner contours; repeat output is byte-identical.
- Excludes: visual quality across varied artwork, thresholding grayscale/color inputs, other backends and platforms.
- Input: generated from `make_input.py`; original geometry is an authored Manhattan-distance ring.
- Environment: macOS 26.6 arm64; Potrace 1.16.
- Install: `brew install potrace` (installed at `/opt/homebrew/bin/potrace`).

## Plan, before running

- Run `./run.sh --record`, inspect the SVG after rasterising at 8× with resvg, then run `./run.sh` again.
- Checks: exact version, SVG XML parses, nonempty `viewBox`, exactly one path with outer and inner contours, repeat output bytes match, retained metrics/hash match.
- Stop if the PBM input is rejected, contour checks fail, or repeated SVG bytes differ.

## Observation, after running

- Executor: Codex; 2026-11-15; `Conors-MacBook-Pro-2.local`.
- Result: both fixture runs passed. Output viewBox `0 0 21.005429 21.005429`, one `<path>` with two contours, 131 path-data bytes, SHA-256 `25cf1f60cf91b4cad7e48f0f6ffd20245f9ba1aa662e7f88dae0b3ef1d711866`. Rasterised with resvg at 512×512 and visually confirmed as a black diamond ring with a transparent centre.
- Scope: one generated PBM ring traced to one SVG path with outer/inner contours using Potrace 1.16 on macOS arm64; no general tracing-quality or cross-platform claim.
