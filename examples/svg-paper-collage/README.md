# SVG paper collage

Status: validated on macOS arm64, 2026-11-20 (Chromium 156.0.8078.4, Playwright 1.64.1; no library).

Inline SVG in a browser scene: six paper pieces, each a `<g>` holding an irregular paper mat path and an embedded raster `<image>`, shadowed by an SVG `feDropShadow` filter. Each group slides, tilts and fades into a layered stack through a paused `element.animate()` animation, seeked per frame via `currentTime`. The raster stills are generated at scene start on an offscreen canvas (seeded PRNG) and embedded as PNG data URLs, so no media files are in the repository.

```text
./run.sh            # capture 90 frames, assert against expected/summary.json
./run.sh --record   # rewrite expected/ after a deliberate change or upgrade
```

## Intent and scope

- Intent: retain, as a fixture, the paper-collage job a production build already did with supplied stills. Existing `svg` evidence is one static file rasterised by resvg; this adds browser rendering, an SVG filter and embedded images.
- Claim: inline SVG with `<image>`, mat paths and `feDropShadow` renders deterministically in any frame order with alpha, seeked through paused `element.animate()` on the `<g>` elements, and the stack settles.
- Out of scope: supplied photographs or other media, SMIL, filters other than `feDropShadow`, other browsers or platforms, 4K, the Web Animations API as a tool in its own right (recorded separately at integration).

## Plan, before running

- Scene: 1280x720, 30 fps, 3 s (90 frames), transparent background, six pieces staggered 250 ms apart (1.1 s each, last ends at 2.35 s), final rotations all different.
- Ready contract: `window.__scene` is set last, after every `<image>` source has decoded through an `Image` probe with non-zero natural size.
- Checks retained in `expected/summary.json` and diffed: 90 frames at 1280x720; shuffled equals sequential; at least two distinct hashes (capture.ts); all six images decoded; frame 0 alpha max (expected 0); frame 45 alpha min 0, max 1 and more than two distinct alpha levels (soft shadow values); last two frames have identical hashes; the six final rotations (read from computed style via Playwright) are pairwise distinct.
- Stop condition: any failed check is a failure, and is not weakened.

## Observation, after running

- 2026-11-20, macOS arm64, host Conors-MacBook-Pro-2.local: Chromium 156.0.8078.4, Playwright 1.64.1, Node v22.19.0. No library (platform SVG plus the Web Animations API).
- Passed on the first run, and on the second (`--record` then verify). 90 frames at 1280x720, shuffled order matches sequential, 6 of 6 images decoded with non-zero natural size, frame 0 alpha max 0, frame 45 alpha min 0 and max 1 with more than two distinct alpha levels, last two frames identical, final rotations -9, 6, -3, 12, -14 and 3.5 degrees (all distinct).
- Contact sheet (frames 0, 15, 30, 45, 60, 89, `output/contact.png`, composited on grey): frame 0 is empty. Pieces then arrive one by one from different edges and settle into an overlapping stack. They read as layered paper: cream mats with visibly wobbly, non-rectangular edges, differently tinted per piece, soft dark drop shadows beneath each, and distinct striped, dotted and checked stills (the stills are visibly semi-transparent in frame 45 while a piece is fading in). Frames 60 and 89 look the same, as the check requires. They are not plain rectangles.
- Frame rate of the capture was about 15 fps (the filters are not cheap); not a correctness issue.
- Proves this scene on this machine. Does not cover other browsers, platforms, real photographs, or filter types beyond `feDropShadow`.
