---
name: ranim
description: Render Ranim (Rust, wgpu) scenes headless to MP4, PNG frames and timed PNG captures. Load once Ranim has been chosen for compiled, GPU-rendered vector motion; tested on 0.2.1 on macOS arm64.
---

# Ranim

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- A Rust function builds a scene (items plus animations); `ranim::cmd::render_scene` renders it with no window to MP4, a PNG sequence and PNG captures at marked times.
- Pre-1.0, APIs change about every six weeks; pin `=0.2.1` and commit `Cargo.lock`. The README documents an unreleased 0.3 API, so read the crate source for 0.2.1.
- Maths and LaTeX explainers: Manim Community. Editor-driven TypeScript: Motion Canvas.
- GPU output may differ across adapters; hashes here are for one Apple GPU only.

## Capability map
Official docs: [site](https://azurice.github.io/ranim/), [repo examples](https://github.com/AzurIce/ranim/tree/main/examples). Tested: `#[scene]` and `#[output(dir, width, height, fps, save_frames, format)]`, `VItem` square, `rotating`, `insert_time_mark(Capture)`, MP4 and frame output. Documented but untested: `ranim-cli` (`render`, `preview`), preview window, WASM host, webm/mov alpha and gif outputs, fading/morph/writing animations, typst text items, 3D items.

## Install and doctor
```text
cargo --version   # Rust toolchain; ffmpeg must be on PATH (else Ranim downloads one into the working directory)
```
`Cargo.toml`: `ranim = { version = "=0.2.1", features = ["render"] }`. Without `render`, `ranim::cmd::render_scene` does not exist. Validated with Rust 1.95.0.

## Smoke test
```text
vcr example create ranim-render-scene && (cd examples/ranim-render-scene && ./run.sh)
# expect: ranim-render-scene: OK  (5 PASS lines; result matches expected/result.txt)
```

## Recipe
```rust
#[scene(clear_color = "#333333ff")]
#[output(dir = "./out", width = 320, height = 180, fps = 12, save_frames = true)]
fn turning_square(r: &mut RanimScene) {
    let _camera = r.insert(CameraFrame::default());
    let mut square: VItem = Square::new(2.0).with(|s| { s.set_color(manim::RED_C); }).into();
    r.insert_with(|t| { t.play(square.rotating(PI / 4.0, DVec3::Z).with_duration(1.0)); });
    r.insert_time_mark(0.5, TimeMark::Capture("at-0500.png".to_string()));
}
fn main() { ranim::cmd::render_scene(&turning_square::scene(), 2); }
```
Output lands under `<dir>/<scene>_<w>x<h>_<fps>.mp4`, `...-frames/NNNN.png` (save_frames) and `<scene>_<w>x<h>_<fps>/<capture name>`. Run the binary from a fresh directory; `dir` is relative to cwd. A capture at time `t` was byte-equal to frame `round(t*fps)`. Build with `CARGO_TARGET_DIR=output/target cargo build --release --locked`.

## Troubleshooting
- `cannot find render_scene in ranim`: enable the `render` feature.
- `which ^8.0.2` not found on first build: stale local crates index; `cargo update`.
- First release build takes minutes (typst, wgpu, reqwest).

## Official docs
https://azurice.github.io/ranim/ and https://github.com/AzurIce/ranim (0.2.1).
