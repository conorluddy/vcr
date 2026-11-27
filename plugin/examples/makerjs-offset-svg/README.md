# Maker.js union and outline offset to SVG and DXF

## Intent and scope

- Tool/version: `makerjs` 0.19.2 (Apache-2.0), from npm, installed with `pnpm add` inside this example.
- Claim: Maker.js builds a parametric 2D model in Node, unions two shapes, offsets the outline outward with `model.outline`, and exports SVG and DXF byte-identical across separate processes; resvg rasterises the SVG.
- Exclusions: text and fonts (opentype.js), Béziers, chains and layout helpers, PDF and OpenJSCAD export, animation, other offset joints, large models.
- Official documentation: https://maker.js.org and https://github.com/microsoft/maker.js; checked 2026-11-27.
- Environment: macOS 26.6 arm64; Node 22.19.0; resvg and ImageMagick for rasterising and size checks.
- Input: constants in `render.mjs`; no external assets.
- Output: ignored `output/` (`plate.svg`, `outline.svg`, `outline.dxf`, PNGs, `metrics.json`).

## Plan, before running

- Run `./run.sh --record`, then `./run.sh`.
- Assert: SVG and DXF bytes identical across two `node render.mjs` processes; plate 80x50 mm and outline 86x56 mm (3 mm offset each side); one path element each; 21 DXF entities; resvg PNGs 800x501 and 800x522; hashes match `expected/metrics.json`.
- Inspect the PNGs at native size. Stop if the union leaves an interior seam, the offset goes inward, or output differs between runs.

## Observation

Executed on 2026-11-27 on `Conors-MacBook-Pro-2.local`. Record and verify runs passed; output was byte-identical across processes. Inspected PNGs: the circle merges into the rounded rectangle with no seam, the 6 mm-radius hole becomes a 3 mm-radius hole in the outline (offset shrinks holes), and the outer edge grew by 3 mm. Defect seen: the SVG viewBox is the exact model extent, so a stroke is half clipped at the image edge; set width and viewBox yourself or draw into a larger model. Not covered: text, other joints, other machines.
