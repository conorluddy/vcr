---
name: vello
description: Use vello_cpu from a small Rust crate to rasterise paths and gradients headless to a transparent RGBA PNG. Load once Vello has been chosen; the VCR fixture covers the CPU route only, not GPU vello.
---

# Vello / vello_cpu

`vcr` below means `node <plugin-root>/cli/vcr.mjs`; in the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Native Rust scene code that needs anti-aliased fills, strokes and gradients written to a transparent PNG with no browser.
- Proven: `vello_cpu` 0.4.0 on macOS arm64, repeat runs byte-identical on one machine. Not proven: GPU `vello` (wgpu), text, `vello_svg`, multithreading, identity across machines.
- Static SVG: use `resvg`. Browser scenes: `canvas-2d` or Playwright. Pre-1.0 with breaking releases about every six weeks: pin exactly.

## Capability map
- [`RenderContext`](https://docs.rs/vello_cpu/0.4.0/vello_cpu/struct.RenderContext.html): `fill_path`, `stroke_path`, `fill_rect`, layers, clips, masks, blurred rounded rects, filters, `glyph_run`. Tested: fill_path, stroke_path, linear and radial gradients, transforms.
- Paints: solid, gradients (linear, radial, sweep), image patterns. Sweep and patterns are untested.
- Output: `Pixmap` (premultiplied RGBA8), `into_png()`. Tested.
- Features: `u8_pipeline` (default, tested), `f32_pipeline` (more accurate, untested), `multithreading` (untested).
- GPU: crates `vello` and `vello_gpu`, untested here.
- Geometry comes from `kurbo`, re-exported as `vello_cpu::kurbo`.

## Install and doctor
```text
cargo --version   # needs Rust >= 1.89
cargo add vello_cpu@=0.4.0
vcr doctor
```
Pin with `=`, commit `Cargo.lock`, build with `--locked`, and set `CARGO_TARGET_DIR` to an ignored directory.

## Smoke test
```text
cd examples/vello-cpu-raster && ./run.sh
# expect: OK: repeat runs byte-identical, matches expected (5e3aba8d81f18f76558d1713b8a2c7c131782c17ba3f3c011a4ec729fd791a15)
```
The first run downloads and compiles about 48 crates.

## Recipe
Create `RenderContext::new(w, h)`, `set_paint` then `fill_path(&shape.to_path(0.1))`, `flush()`, then `render(&mut Pixmap, &mut Resources::new())` and `pixmap.into_png()`. Reset `set_transform(Affine::IDENTITY)` between shapes. See `examples/vello-cpu-raster/src/main.rs`.

## Troubleshooting
- `cargo` missing or too old: install or update Rust yourself; the fixture fails rather than skips.
- Draw a frame per `t` by building the scene as a pure function of `t`; no animation API is used or tested.

## Official docs
- [vello_cpu 0.4.0 on docs.rs](https://docs.rs/vello_cpu/0.4.0)
- [Vello repository](https://github.com/linebender/vello)
