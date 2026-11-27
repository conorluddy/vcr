# Ranim headless scene render

## Intent and scope

- **Tool/version:** Ranim 0.2.1 (crates.io, MIT), library route: `ranim::cmd::render_scene` called from a 30-line `main`, not the `ranim-cli`. Rust 1.95.0, FFmpeg 9.0.2 on PATH.
- **Claim:** a short scene renders headless on macOS to MP4, a PNG sequence and PNG captures at named times; a second run is byte-identical; frames can be inspected.
- **Exclusions:** `ranim-cli`, preview window, WASM, text/typst items, 3D, alpha formats (webm, mov), other GPUs or hosts, other resolutions.
- **Sources:** [repo](https://github.com/AzurIce/ranim), [docs](https://azurice.github.io/ranim/), crate source in the cargo registry. Checked 2026-11-27.
- **Environment:** macOS 26.6 arm64, Apple GPU via wgpu (Metal).
- **Input:** generated: 2-unit red square on `#333333`, rotated 45 degrees over 1 s, 320x180 at 12 fps.
- **Side effects:** `cargo build` downloads crates into `~/.cargo`; everything else is under ignored `output/` (`CARGO_TARGET_DIR=output/target`). `Cargo.lock` is committed and the build uses `--locked`.

## Plan, before running

- **Commands:** `./run.sh --record`, then `./run.sh`. It builds, runs the binary in `output/r1` and `output/r2`, and summarises each.
- **Predeclared checks:** 12 PNG frames; MP4 is h264 320x180 12/1 fps with 12 frames; trimmed square bbox 46x46 at frame 0 and 64x64 at frame 11 (rotation); captures at 0.0, 0.5 and 0.9 s byte-equal frames 0, 6 and 11; run 2 equals run 1 for every PNG hash and decoded MP4 frame hash; result equals `expected/result.txt`.
- **Stop conditions:** cargo or ffmpeg missing (run.sh fails), no GPU adapter, build failure. A failed check would stay as KNOWN FAIL in `expected/known-fail.txt`.
- **Inspect:** montage of frames 0, 3, 6, 9, 11.

## Observation, after running

- **2026-11-27:** `cargo build` first failed on `which ^8.0.2` against a stale local index; `cargo update` refreshed the lock (Cargo.lock holds the resolved versions). `ranim::render_scene!` is not exported without the `render` feature; the example enables it and calls the function directly.
- All five checks passed; `run.sh` exits 0 on repeat. Hashes in `expected/result.txt` are for this machine (Apple GPU), not claimed portable.
- Frames inspected: the square sits centred and turns steadily to a diamond; edges are anti-aliased, no artefacts.
- **Does not establish:** other adapters, CLI, preview, text, alpha outputs, API stability (pre-1.0).
