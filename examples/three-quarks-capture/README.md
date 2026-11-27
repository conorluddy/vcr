# three.quarks particles, seeked through packages/capture

## Intent and scope

- Tool/version: `three.quarks` 0.18.0 (with `quarks.core` 0.18.0) on `three` 0.186.1, MIT.
- Claim: a three.quarks particle system can be a pure function of `t`. `seek(t)` rebuilds the system, reseeds `Math.random` and steps `batchRenderer.update(1/60)` from 0 to `t`; the frame at `t` is identical whatever order frames are requested in.
- Exclusions: trail and mesh particles, JSON effects from the quarks.art editor, `prewarm`, `looping`, WebGPU, sub-emitters, and speed on long timelines.
- Documentation: https://github.com/Alchemist0823/three.quarks, checked 2026-11-27. The library has no seed option; its source calls `Math.random` in the emitters and value generators.
- Environment: macOS 26 arm64, Node 22.19.0, Chromium via Playwright, WebGL, `captureMode: screenshot`.
- Input: the system is defined in `scene.html`; the sprite is a radial gradient drawn on a canvas. No external assets.
- Install: `pnpm add --save-exact three.quarks` in this example; nothing global.

## Plan, before running

- Run `./run.sh --record`, then `./run.sh`.
- Assert: 90 frames at 640x360; `shuffled_matches_sequential` true (`verifyDeterminism` recaptures in shuffled order); 90 distinct frame hashes (the system evolves every frame); frame 45 alpha minimum 0 and maximum above 0 (transparent clear colour, particles drawn).
- Inspect frames 15, 45 and 89 over a dark background. Stop if particles do not move, if all frames match, or if any shuffled frame differs.
- Expected failure: unseeded `Math.random` would make shuffled frames differ.

## Observation

Executed 2026-11-27 on `Conors-MacBook-Pro-2.local`. All checks passed on the recording and the verifying run: 90 frames, shuffled equals sequential, 90 distinct hashes, frame 45 alpha 0 to 1, about 19 fps including the determinism re-run. Frames 15, 45 and 89 show a cone fountain of orange and cyan soft sprites that rises, spreads and fades, with more particles by frame 45. This covers one sprite system on one machine. Replay cost grows with `t`; a long timeline would need baked transforms instead.

```text
./run.sh            # expect: three-quarks-capture: OK (~19 fps, 90 distinct hashes)
./run.sh --record
```
