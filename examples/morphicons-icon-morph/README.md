# morphicons pure-core icon morph

## Intent and scope

- Tool/version: `morphicons` 2.0.2 (npm, MIT), root entry only (the "pure core, no DOM").
- Claim: two unrelated stroke icons (Lucide `menu`, 3 lines; `x`, 2 lines) morph as a pure function of `progress` in plain Node: `resampleIcon` and `buildPlan` once, then `interpPolar` and `serialize` per frame, with no DOM, spring or clock. Output is byte-identical across processes.
- Exclusions: `morphicons/dom`, React, Vue and Svelte bindings, spring physics, filled icons (`morphicons/region`), icons on other viewBoxes (`fitIcon`), motion quality beyond the five sampled frames, and capture inside a browser scene.
- Official documentation: https://github.com/guillermolg00/morphicons (README and `dist/*.d.ts` of 2.0.2); checked 2026-11-27. The lead listed the pure core as undocumented; the README names it and `dist/index.js` exports it.
- Environment: macOS arm64; Node 22.19.0; resvg 0.47.0; ImageMagick for the montage size check.
- Input: two `d` strings in `render.mjs`. Output: ignored `output/` (frame SVGs and PNGs, `frames.json`, `contact.png`, `metrics.json`).

## Plan, before running

- Run `./run.sh --record`, then `./run.sh`.
- Assert: `frames.json` is byte-identical across two processes; asking for progress 0.5 twice in one process gives the same path; every coordinate stays inside the 24 grid; progress 0 has only y values 6, 12 and 18; progress 1 spans exactly 6 to 18; the midpoint differs from both ends; per-frame command counts and hashes match `expected/metrics.json`; the montage is 1200x240.
- Inspect `output/contact.png` at native size. Stop if the middle frames are not a plausible transition.

## Observation

Executed 2026-11-27 on `Conors-MacBook-Pro-2.local`; record and verify runs passed. The plan has 3 subpaths (the third menu bar collapses into the X); every frame is 192 polyline commands. The contact sheet shows three bars, then a fan and crossing bars, then a clean X; frame 0 and frame 1 match the source icons. Intermediate frames are polylines sampled at 64 points, not the original curves, and the in-between look (bars crossing before settling) is the library's, not tuned here. One icon pair on one machine.
