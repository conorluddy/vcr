# AVAL packed-alpha compile

## Intent and scope

- Tool/version: `@pixel-point/aval-compiler` 1.1.0 (npm; MIT), `avl` CLI; ffmpeg and ffprobe from Homebrew on PATH.
- Claim: the compiler turns a VCR-style RGBA PNG sequence into per-codec `.avl` files with packed alpha, deterministically.
- Exclusions: the `<aval-player>` browser runtime and WebCodecs decoding, state graphs with edges, AV1 (this ffmpeg has no `libaom-av1`), video sources, other machines, visual quality of the decoded alpha.
- Official documentation: https://github.com/pixel-point/aval (`packages/compiler/README.md`, `docs/project/1.0.md`); checked 2026-11-27.
- Environment: macOS 26 arm64; Node 22.19.0.
- Input: `make-frames.mjs` writes 30 frames of a 128x128 anti-aliased disc swinging once per loop, transparent background; `motion.json` is the project (one looping body unit, 30 fps, `alpha: packed`).
- Output: ignored `output/` (frames, two bundles, `summary.json`, `contact.png`).

## Plan, before running

- Run `./run.sh --record`, then `./run.sh`. It fails if ffmpeg, ffprobe, the three encoders or `node_modules/.bin/avl` are missing.
- Assert: `vp9.avl`, `h265.avl`, `h264.avl` each start `AVLF`, manifest `layout` is `packed-alpha` with a stacked alpha rect, 30 frames, canvas 128x128; two compiles of the same project are byte-identical; `build.json` warnings are empty; the same project with `alpha: opaque` is refused.
- Stop if the loop warning fires (the swing is meant to close), or the compile is not repeatable.

## Observation

Executed 2026-11-27 on `Conors-MacBook-Pro-2.local`. All checks passed. Each manifest reports `packed-alpha`, coded size 128x264 (colour 128 rows, alpha 128 rows stacked), 30 frames. Repeat compiles were byte-identical on this ffmpeg build; `build.json` embeds ffmpeg identity, so hashes are not recorded in `expected/`. The `opaque` project failed with `ALPHA_POLICY_REJECTED`. An earlier left-to-right slide produced a loop-seam warning, which the swinging source fixed. Source frames were inspected in `output/contact.png`: the orange disc moves and the background is transparent. Output sizes were roughly 7 to 11 kB per codec.

Not established: that a browser decodes and composites the alpha correctly, and anything about AV1.
