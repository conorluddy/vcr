# MaxRects packing of rectangles into atlas bins

## Intent and scope

- Tool/version: `maxrects-packer` 3.0.0 (npm, MIT).
- Claim: 24 seeded rectangles pack into 256x256 bins with 2 px padding, every rectangle placed once at its own size, inside its bin, with no overlaps, and the layout is byte-identical across separate processes when the inputs are sorted first.
- Exclusions: compositing pixels into an atlas image (sharp's job), rotation (`allowRotation`), other algorithms or logic options, removing or re-adding rectangles, `pot` and `square` bins, large inputs and speed.
- Official documentation: https://github.com/soimy/maxrects-packer; checked 2026-11-27.
- Environment: macOS arm64; Node 22.19.0; resvg and ImageMagick only to draw and size the preview.
- Input: sizes from a seeded LCG in `render.mjs`; no external assets.
- Output: ignored `output/` (`layout.json`, `bin-N.svg`, `bin-N.png`, `metrics.json`).

## Plan, before running

- Run `./run.sh --record`, then `./run.sh`.
- Assert: layout hash equal across two `node render.mjs` processes; placed count equals 24; unique ids; sizes unchanged; inside the bin; no pair overlaps in a bin; minimum gap at least the padding; bin count, per-bin counts, fill and layout hash match `expected/metrics.json`; bin PNG is 256x256.
- Inspect the preview at native size. Stop and report if any check fails; do not loosen it.

## Observation

Executed on 2026-11-27. Recording and verifying runs both passed with no check loosened. 24 of 24 placed in 2 bins (16 and 8 rectangles; fill 75.5% and 35.8%), minimum gap 2. The preview was inspected at native size: rectangles are packed tightly with visible padding, and none overlap or cross the border. This covers one input set and `smart: true` on one machine; it does not cover other options, rotation or atlas image compositing. The packer returns positions only.
