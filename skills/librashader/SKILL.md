---
name: librashader
description: Apply a RetroArch slang shader preset (CRT, scanline looks) to a still or generated frame with librashader-cli on the Metal runtime. Use when a frame sequence needs a retro display look from the libretro slang-shaders library; check each shader's licence first.
---

# librashader

`vcr` below means `node <plugin-root>/cli/vcr.mjs`; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- One image in, one PNG out, per `render` call, with a preset and a frame number. A sequence is a shell loop over frames (verified: 3 frames, any order, identical bytes).
- Verified route: Metal runtime, macOS arm64, single-pass presets `crt-lottes` and `crt-geom`. The `wgpu` runtime failed here with `Unsupported features were requested: PIPELINE_CACHE` (KNOWN FAIL in the example).
- Hashes are GPU-specific: a different GPU or runtime may differ in bytes.
- Single shader files or live editing: `glslviewer`. Looks from other plugin families: `frei0r`, `g-mic`.

## Capability map
`librashader-cli` subcommands: `render`, `compare`, `parse`, `pack`, `preprocess`, `transpile`, `reflect`; see [CLI.md](https://github.com/SnowflakePowered/librashader/blob/master/CLI.md). The fixture exercises only `render` with `--preset --image --out --runtime --dimensions --frame`. `--params`, `--passes-enabled`, `--rotation`, subframes, wildcards and the other subcommands are untested. Presets come from [libretro/slang-shaders](https://github.com/libretro/slang-shaders).

## Install and doctor
Cargo only; no Homebrew formula. Install into a project directory, never `~/.cargo/bin`:
```text
cargo install librashader-cli --version 0.12.1 --locked --root output/cargo --no-default-features --features metal,wgpu
output/cargo/bin/librashader-cli --version   # expect: librashader-cli 0.12.1
```
The default `full` features need `cmake` (OpenGL, glfw). The crate declares no MSRV; rustc 1.95.0 built it in about 3 minutes. Pin the shader repository commit and verify file hashes before use.

## Smoke test
```text
vcr example create librashader-crt-preset && (cd examples/librashader-crt-preset && ./run.sh)
# expect: KNOWN FAIL wgpu_runtime_renders: ... PIPELINE_CACHE
# expect: librashader-crt-preset: OK
```

## Recipes
```text
librashader-cli render -p crt/crt-lottes.slangp -i frame.png -o crt.png -r metal -d 960x720 --frame 0
```
- Fetch the `.slangp` and the `shaders/*.slang` it names with the same relative layout; paths in the preset are relative.
- `-d` takes `WIDTHxHEIGHT` or `N%`; upscale 3x or more so scanlines and mask have rows to modulate.
- Output is RGBA; flatten or `-alpha off` before measuring luminance (ImageMagick `fx:mean` includes alpha).
- Licences: `crt-lottes` is public domain; `crt-geom` and `crt-easymode` are GPL. Record each shader's licence beside the output.

## Troubleshooting
- `cmake` not found during install: drop OpenGL with `--no-default-features --features metal,wgpu`.
- `-r wgpu` fails with `PIPELINE_CACHE`: use `-r metal`.

## Official docs
https://github.com/SnowflakePowered/librashader (version 0.12.1), https://crates.io/crates/librashader-cli
