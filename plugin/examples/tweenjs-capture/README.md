# tween.js capture

## Intent and scope
tween.js 25.0.0 (`@tweenjs/tween.js`, UMD build `dist/tween.umd.js`) drives chained tweens with easing and yoyo inside a `TWEEN.Group` that is started at time 0 and advanced only by explicit `group.update(ms)` calls; the state is drawn to Canvas 2D and captured as 90 transparent PNG frames at 1280x720, 30 fps. Claim: shuffled capture equals sequential. Excludes: `performance.now` timing (never read), interactive use, the TWEEN singleton, Three.js, SVG/DOM targets, React, Node rendering and other browsers. Procedural original shapes; no media or fonts. Code MIT per npm metadata, checked 2026-11-11: https://www.npmjs.com/package/@tweenjs/tween.js and https://github.com/tweenjs/tween.js (LICENSE file to be confirmed on the card: GitHub detection reports NOASSERTION). API https://tweenjs.github.io/tween.js/ . No codec, model or asset dependency.

## Plan, before running
On macOS arm64, install pinned `@tweenjs/tween.js` 25.0.0 in this example's `package.json` (pre-approved), then `pnpm install`; reuse Playwright 1.64.1 and tsx 4.23.15. Run `examples/tweenjs-capture/run.sh --record`, inspect frame 45 at 1280x720, then `examples/tweenjs-capture/run.sh`.

Seek design: `seek(t)` builds a new `Group` and new tweens on every call, starts them at explicit time 0, then calls `group.update` in explicit 10 ms steps up to `t*1000`. Rebuilding per seek is required because completed tweens are removed from a group, so rewinding would be wrong; the fixed step is required because tween.js applies only one repeat (yoyo) step per update call, so a single `update(2500)` across the yoyo boundary gives the wrong position (checked in node: at t=2.2 s a single update gave x=1120 where stepped updates give x=140).

Predeclared checks: 90 frames at 30 fps, 1280x720, at least two distinct frame hashes, every shuffled hash equal to sequential, frame 45 alpha minimum 0 and maximum 1. Stop on missing dependencies, blank output or any mismatch. Units are seconds and pixels. Transparent PNG sequence only; no delivery byte budget or compression claim. Outputs and reports in ignored `output/`; delete that directory to clean up. No cross-machine byte equality asserted.

## Observation, after running
2026-11-11, evidence-runner agent on Conors-MacBook-Pro-2.local, macOS Darwin 25.6.0 arm64, Node 22.19.0, @tweenjs/tween.js 25.0.0 (UMD global `TWEEN`), Playwright 1.64.1, Chromium 156.0.8078.4, ImageMagick 7.1.2-15. Screenshot capture route, Canvas 2D backend. GPU details unknown and not claimed.

`run.sh --record` then `run.sh`: both exited 0; the second printed `tweenjs-capture: OK`. Capture report: 90 frames, 1280x720, shuffled order matched sequential for every frame; frame 45 alpha 0 to 1. Capture log had no page errors. Two extra probes in node (not kept): a single `group.update(2500)` across the yoyo boundary gave x=1120 at t=2.2 s, against x=140 with stepped updates, which is why `seek` steps explicitly. Visual check of the contact sheet (frames 0, 15, 30, 45, 60, 75): the dot moves out to x=1120 by 1.0 s and back to x=140 by 2.0 s, lifts with overshoot after 2.0 s (y about 227 at 2.5 s, matching the probe), and the ring grows with the quadratic easing; nothing clipped or blank.

Result: pass for the stated claim. Not established: interaction, the tween.js singleton or a persistent group (not tested), Three.js or DOM targets, other browsers or platforms, or cross-machine byte equality. Agent visual review only; no human approval claimed. Revalidate on tween.js, Playwright or Chromium changes.
