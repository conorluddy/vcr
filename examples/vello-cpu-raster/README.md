# vello_cpu raster fixture

## Intent and scope

- Tool and version: `vello_cpu` 0.4.0 (crates.io 2026-11-11), Rust 1.95.0 (MSRV 1.89).
- Claim: a Rust crate draws a rotated linear-gradient rectangle, a radial-gradient circle and a stroked cubic with vello_cpu onto a transparent 320x240 canvas and writes a PNG that repeats byte for byte across fresh processes.
- Exclusions: GPU `vello` (wgpu/Metal), text, `vello_svg`, multithreading, other machines or OS.
- Sources, checked 2026-11-27: https://github.com/linebender/vello, https://docs.rs/vello_cpu/0.4.0; Apache-2.0 OR MIT.
- Environment: macOS 26.6 arm64, cargo 1.95.0 already on PATH.
- Input: geometry in `src/main.rs`; no assets.
- Dependencies: `vello_cpu =0.4.0` pinned, `Cargo.lock` committed, built with `--locked`. Build output goes to `output/target` (ignored). First run downloads crates.

## Plan, before running

- Commands: `./run.sh --record`, inspect `output/run1.png`, then `./run.sh`.
- Predeclared checks: 320x240; corner (2,2) is `[0,0,0,0]`; centre of the linear rect and radial circle are opaque; two fresh processes give identical stdout facts and PNG SHA-256; run matches `expected/metrics.json`.
- Stop conditions: Rust older than 1.89, compile failure, differing repeats. `run.sh` fails if cargo is missing.

## Observation

- 2026-11-27, `Conors-MacBook-Pro-2.local`. Record and verify runs exit 0.
- 44742 transparent, 30263 opaque, 1795 partial-alpha pixels. Probes: linear centre `[255,153,13,255]`, radial centre `[0,255,255,255]`, radial edge `[0,0,157,255]`. PNG SHA-256 `5e3aba8d81f18f76558d1713b8a2c7c131782c17ba3f3c011a4ec729fd791a15`, identical across two processes.
- Inspected at 2x on a grey background: smooth gradients, anti-aliased edges, rounded stroke ends, transparent surround.
- Result: pass. Not shown: cross-machine determinism (the lead flags it as unverified), GPU route, text.
