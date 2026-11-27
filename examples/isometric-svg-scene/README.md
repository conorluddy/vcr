# Isometric scene frames as static SVG

## Intent and scope

- Tool/version: `@elchininet/isometric` 4.0.2 (Apache-2.0) with `jsdom` 31 (the Node entry needs it).
- Claim: in Node, a scene built from time `t` becomes static SVG that is byte-identical across processes and render order, has no SVG animation elements, and rasterises through resvg. This is the route VCR needs, since the library's own animations are not seekable.
- Exclusions: `IsometricText` (font dependent), circles, stars, free paths, textures, groups, dragging, the library's animations, the browser build, and larger scenes.
- Official documentation: https://github.com/elchininet/isometric (README read from the installed 4.0.2 package, 2026-11-27).
- Environment: macOS 26.6 arm64; Node 22.19.0; resvg 0.47.0; ImageMagick for size checks and the contact sheet.
- Input: none; scene is in `scene.mjs`. Output: ignored `output/` (`frame-<t>.svg|png`, `contact-sheet.png`, `metrics.json`).

## Plan, before running

- Run `./run.sh --record`, then `./run.sh`.
- Scene: 6x6 floor, block `a` fixed (2x2x1), block `b` (2x2) of height `1 + 3t`; frames t = 0, 0.5, 1; 800x600, scale 40.
- Predeclared checks: (1) frame SVGs are identical across two `node render.mjs` processes; (2) rendering in shuffled order (1, 0, 0.5, 0, 1) in one process equals the sequential files; (3) the element ids are exactly the ten explicit ones (the library otherwise generates random ids, seen in a probe); (4) 7 `<path>` per frame and no `animate`, `text`, `pattern`, `image`, `style` or `script`; (5) block `b`'s top moves up exactly 120 px between t=0 and t=1 (3 units x scale 40); (6) three distinct hashes; (7) resvg gives 800x600 PNGs; (8) metrics match `expected/metrics.json`.
- Inspect the contact sheet at native size. Stop if faces are misplaced or the blocks float.

## Observation

Executed 2026-11-27 on `Conors-MacBook-Pro-2.local`. Before the predeclared run, a probe showed random ids and my first face placement was wrong (planes meet nothing); after fixing placement from the documented axes and passing explicit ids, nothing in the checks was loosened. Record and verify both passed: 7 paths per frame, top tip y 320, 260, 200 (rise 120 px), frames 1764 bytes each. The contact sheet shows a floor with a fixed blue block and an orange block growing across the frames, with correct top and two visible faces. Covers rectangles only, one machine.
