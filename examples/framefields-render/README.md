# framefields: headless WebGPU frames and MP4 from TypeScript

Status: validated on macOS arm64, 2026-11-27 (framefields 3.0.2, Node v22.19.0), for the scope below. The checks were fixed before the recorded run; the observation follows it.

## Intent and scope

- Tool: `framefields` npm 3.0.2 (Apache-2.0 per the package `license` field and the repository). Record: `catalog/tools/framefields.json`.
- Claim: in Node with no browser, a `Composition` renders any frame by index to raw RGBA on native WebGPU; the same frame hashes identically whether rendered in order or shuffled and across two runs; `renderVideo` writes an h264 MP4 of the right size and frame count.
- Exclusions: 3D scenes, effects and shaders, audio content (the MP4 carries a silent AAC track the engine adds), vision/SAM models, the AI gateway (no `FRAMEFIELDS_API_KEY`, no network use by the scene), components registry, preview server, hardware-encoder behaviour, cross-machine or cross-GPU byte equality, Linux or Windows, performance.
- Sources: https://github.com/gatewai-dev/framefields README and the shipped `dist/index-*.d.mts` typings, read 2026-11-27. Optional SAM 3 weights (Meta SAM License) are not used.
- Environment: macOS 26.6 arm64 (Apple M3 Pro), Node v22.19.0, native WebGPU (Dawn; Metal expected on this Mac). The package's render path does not print the adapter, so it is not recorded.
- Input: none. The composition is in `render.ts` (a rounded orange box with the word FRAME, sliding in from the left with a fade over 18 frames). Font: JetBrains Mono Bold (OFL, `assets/fonts/OFL.txt`), copied from `examples/skia-canvas-frames`.
- Dependencies and side effects: `framefields@3.0.2` and `tsx` in this example's `package.json`. Two things need help on a clean checkout, and `run.sh` does both and fails if it cannot: (1) pnpm skips `@napi-rs/webcodecs-darwin-arm64` because that package declares Node `^22.20`, so `run.sh` reinstalls with `--config.nodeVersion=22.20.0` (the binding then loads on 22.19); (2) pnpm ignores the `skia-canvas` install script, so `run.sh` runs that package's own `lib/prebuild.mjs download` (network, into its own directory). No machine-level install.
- Output: `output/` (ignored): frames as PNG, `film.mp4`, `render.json`.

## Plan, before running

- Command: `./run.sh --record`, then `./run.sh`.
- Composition: 320x180, 12 fps, 24 frames. Probe frames 0, 6, 12, 18, 23 rendered sequentially via `renderFrame({ frame, format: "rgba" })`, then in order 18, 0, 23, 12, 6.
- Predeclared checks: (1) 320x180; (2) raw frame is 230400 bytes; (3) at least 4 distinct hashes among the 5 probes; (4) shuffled hashes equal sequential; (5) two runs give byte-identical `render.json`; (6) the MP4 is h264, 320x180, 24 counted video frames (ffprobe `-count_frames`); (7) the engine logs no `error`; (8) `render.json` equals `expected/render.json`.
- Stop conditions: no GPU adapter (blocked); frames differing between runs or order (fail or partial, recorded, not loosened).
- Inspection: contact sheet of the five PNG frames, viewed.

## Observation, after running

- Date and executor: 2026-11-27, Conors-MacBook-Pro-2.local, macOS 26.6, Apple M3 Pro.
- Result: all checks passed. `./run.sh` printed `framefields-render: OK (framefields 3.0.2, node v22.19.0, 4 distinct frames, shuffled equals sequential, mp4 24 frames)`. Frames 18 and 23 hash the same because the animation ends at frame 18, which accounts for 4 distinct hashes from 5 probes. A 24-frame render ran at about 114 fps on this machine.
- Inspection found a real defect in the first attempt, before recording: the text did not draw, and the numeric checks would still have passed. The engine resolves a font by family name as the file stem under `assets/fonts/<family>.ttf` (relative to the working directory) and logs an error, not an exception, when it cannot. The fixture now keeps the font at `assets/fonts/JetBrainsMono-Bold.ttf`, uses `fontFamily: "JetBrainsMono-Bold"`, and check (7) was added so `run.sh` fails when the engine log contains `error`. The recorded frames show the text, the box sliding in with a fade, and a clean rest state.
- Deviations: Node 22.19 is below what the native binding declares (^22.20); it loaded and ran anyway. The README's "Node >= 22" is therefore optimistic for a fresh install under pnpm.
- Establishes: on this Mac, framefields 3.0.2 renders frame-addressed raw RGBA and an h264 MP4 headlessly, deterministically across order and reruns.
- Does not establish: other machines or GPUs, byte-stability of the MP4 itself (only its probed properties), 3D, effects, audio, vision, quality at 1080p, or any hosted gateway use.
