# p5.brush hatching and flow lines, captured by seek

## Intent and scope

- Tool/version: `p5.brush` 3.3.0 (MIT) on `p5` 2.3.4, instance mode, WEBGL canvas, via `packages/capture` (Playwright Chromium, screenshot mode).
- Claim: a natural-media scene (hatched watercolour-style fill, charcoal outline, flow-field strokes, marker rect) is a pure function of `t` and a seed: 90 frames at 1280x720 with alpha, shuffled capture equals sequential.
- Exclusions: the standalone (no p5) build, brush.load buffers or framebuffers, custom image brushes, other seeds, a hardware GPU (the harness's own Chromium WebGL backend ran), and anything beyond macOS arm64.
- Docs: https://github.com/acamposuribe/p5.brush (README shipped in the npm package), checked 2026-11-27.
- Input: none; shapes are in `scene.html`. Output: ignored `output/`.

## Plan, before running

- `./run.sh --record`, then `./run.sh`.
- Assert: 90 frames, 1280x720, `shuffled_matches_sequential` true; frames 0, 30 and 60 contain transparent and opaque pixels; frames differ over time.
- Inspect frames at native scale. Stop if the picture is blank or the shuffled check fails.

## Observation

Executed 2026-11-27 on `Conors-MacBook-Pro-2.local`. All 90 frame hashes were unique and shuffled matches sequential; alpha spans 0 to 1. Frames show a hatched watercolour wash disc, flow lines bending and moving with `t`, and a marker rectangle (outline only).

Findings:
- First attempt (`draw` called directly from a custom `redraw`, only `randomSeed` and `noiseSeed`) was not deterministic and logged `hatch() angle must be finite`. Calling p5's own `redraw()` after setting the time, and also calling `brush.seed(SEED)` and `brush.noiseSeed(SEED)` each frame, made it deterministic. Which of the two is the necessary one was not isolated.
- `hatch(dist, angle)` takes radians under p5's default `angleMode`.
- Brush fills are slow: about 4 to 6 frames per second including the determinism re-run.

```text
./run.sh            # expect: p5-brush-hatching: OK (~5 fps)
./run.sh --record
```
