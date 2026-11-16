# Satori flexbox rectangles to SVG

## Intent and scope

- Tool/version: Satori 0.63.2, React 19.2.0.
- Claim: produce deterministic SVG canvas and flexbox rectangle geometry from a self-authored React element tree without text or font data.
- Exclusions: text layout, fonts, unsupported CSS, browser rendering, and general HTML/CSS fidelity.
- Official documentation: https://github.com/vercel/satori; checked 2026-11-16. Satori converts a stateless element tree to SVG; the fixture avoids text, which requires explicit font data.
- Environment: macOS 26.6 arm64; Node 22.19.0; resvg 0.47.0.
- Input: authored element tree in `render.mjs`; no external assets.
- Dependencies are pinned in this fixture's package manifest and lockfile.
- Output: ignored `output/` directory.

## Plan, before running

- Run `./run.sh --record`, then repeat `./run.sh`.
- Assert 320×180 SVG viewBox, exact container and colored child rectangle positions/sizes, no text nodes, stable SVG hash, and a 320×180 PNG rasterized by resvg.
- Inspect the PNG at its native size. Stop if Satori requires a font for this rectangle-only tree or geometry differs.
- Reproduce by running `npm ci && ./run.sh` from this directory.

## Observation

Executed twice on 2026-11-16 by the maintainer on `Conors-MacBook-Pro-2.local`. Both runs passed; the SVG hash was `c4420667620f1c53e4701a2ee512deb91b8c862d62e5663b68f2769fdfb3d8bd`. Resvg produced the expected 320×180 raster, visually inspected at native size. This confirms one fontless rectangle layout route only; it does not test text, font loading or broader CSS support.
