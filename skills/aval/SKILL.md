---
name: aval
description: Compile a VCR-rendered RGBA PNG sequence into packed-alpha .avl files with the AVAL compiler for a stateful web player. Load once AVAL has been chosen to ship a transparent raster loop to a web page; the browser player is untested.
---

# AVAL compiler

`vcr` below means `node <plugin-root>/cli/vcr.mjs`; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- VCR evidence covers `@pixel-point/aval-compiler` 1.1.0 (`avl`) turning 30 owned 128x128 RGBA PNG frames into VP9, H.265 and H.264 `.avl` files with packed alpha, on macOS arm64. Manifests were parsed; nothing was decoded.
- The `<aval-player>` element, WebCodecs playback, AV1 (this machine's ffmpeg has no `libaom-av1`), video sources and state edges between units are untested.
- Not a replacement for plain video delivery (`ffmpeg-ffprobe`), nor for vector players (`lottie-web`, `dotlottie`, `rive-web`). The format is young (repository from July 2026, wire format 1.1): pin versions.

## Capability map
- [Compiler README](https://github.com/pixel-point/aval/blob/main/packages/compiler/README.md): `avl compile`, direct media input, compression controls, build report; `avl alpha` for transparent video to packed-alpha MP4/WebM.
- [`motion.json` format](https://github.com/pixel-point/aval/blob/main/docs/project/1.0.md): canvas, sources, encodings, units, states, edges, bindings.
- Tested: PNG-sequence source, one looping body unit, three codecs, `alpha: packed`, repeat-compile determinism, `alpha: opaque` refusal. Everything else is documented but untested.

## Install and doctor
```text
pnpm add @pixel-point/aval-compiler@1.1.0
```
Needs Node 22.12+ and ffmpeg and ffprobe on PATH with `libx264`, `libx265`, `libvpx-vp9` (and `libaom-av1` for AV1). Run `vcr doctor` for ffmpeg. This does not claim anything is installed.

## Smoke test
```text
./examples/aval-packed-alpha/run.sh
# expect: opaque refusal: ERROR ALPHA_POLICY_REJECTED ...  then  OK: aval-packed-alpha
```

## Compile recipe
Every top-level field of `motion.json` is required, even empty `edges` and `bindings`. Source paths are relative to the project directory and may not use `..`.
```sh
pnpm exec avl compile motion.json --out dist/motion   # --force replaces an existing bundle
```
Output: one `<codec>.avl` per encoding plus `build.json`, whose `sourceMarkup` holds the `<source ... integrity=...>` lines to paste. Each `.avl` starts `AVLF`; the JSON manifest sits at offset 0x40 with its length at 0x28 (little-endian), and `layout` reads `packed-alpha`. `examples/aval-packed-alpha/check.mjs` parses it. `build.json` embeds the ffmpeg identity, so hashes differ between machines.

## Troubleshooting
- `WARNING <unit> loop needs visual review`: the last frame jumps to the first. Make the source close its loop.
- `ALPHA_POLICY_REJECTED`: `alpha: opaque` met a transparent pixel; use `auto` or `packed`.
- Missing encoder: the compiler refuses a codec ffmpeg cannot encode; check `ffmpeg -encoders`.
- Slow encodes: the README examples use the slowest presets; the fixture uses `good` and `medium`.

## Official docs
- [AVAL repository](https://github.com/pixel-point/aval)
- [Compiler on npm](https://www.npmjs.com/package/@pixel-point/aval-compiler)
