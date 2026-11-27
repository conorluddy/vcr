# ntsc-rs applies a seeded VHS preset to a generated clip

## Intent and scope

- Tool ID and version/build: `ntsc-rs` 0.9.7 (`ntsc-rs-cli`, macOS standalone `.pkg`, release v0.9.7). The lead listed no version; the release page gave v0.9.7.
- VCR job and exact claim: `ntsc-rs-cli` applies a fixed JSON preset with a fixed `random_seed` to a generated 10-frame ffmpeg `testsrc` clip and writes a lossless FFV1 file that is deterministic (a repeat run has identical frame hashes), seed-dependent (another seed changes every frame) and visibly degraded (inspected; PSNR against the source between 10 and 25 dB, no frame unchanged).
- Explicit exclusions: GUI, OpenFX and After Effects plugins; the PNG-sequence codec (see Observation); H.264 output; stills; scaling and interlace options; other versions, platforms and machines (hashes are recorded for this host only); any claim that the look matches real VHS.
- Licence and sources, checked 2026-11-27: [repository](https://github.com/ntsc-rs/ntsc-rs); the `ntscrs` crate declares `MIT OR ISC OR Apache-2.0` (the repository carries LICENSE-MIT, LICENSE-ISC and LICENSE-APACHE-2.0; GitHub reports no single SPDX id). The macOS bundle also ships GStreamer (LGPL and others), not assessed here. Lead said licence unverified; it is permissive, not GPL.
- Environment: macOS 26 arm64, ffmpeg and ffprobe from Homebrew, Python 3.
- Input: `ffmpeg -f lavfi -i testsrc=size=320x240:rate=10:duration=1`, encoded to lossless H.264 (yuv444p, crf 0) because the CLI reads media through GStreamer. Owned, generated.
- Dependencies, install plan, side effects: `run.sh` downloads the official `ntsc-rs-macos-standalone.pkg` (90 MB) pinned by SHA-256 `51ca362a...04c1e0` and unpacks it with `pkgutil --expand-full` into `output/pkg/`. Nothing goes to `/Applications` or `PATH`. Needs network on a clean checkout; fails if the download or hash fails. Remove `output/` to clean up.

## Plan, before running

- Commands: see `run.sh`: render the source with `preset.json` twice (a, b) and with seed 4321 (c): `ntsc-rs-cli -i src.mp4 -o X.mkv -c ffv1 -p <preset> -y`; then `check_output.py`.
- Preset: flat JSON (`version` 1; group switches are booleans and their children flat keys; enums are integers): seed 1234, composite and chroma noise, snow, tracking noise, head switching, VHS tape speed 2.
- Predeclared checks: output is FFV1 320x240 with 10 frames; a and b frame MD5s identical; c differs from a on all 10 frames; no a frame equals its source frame; PSNR(source, a) in (10, 25) dB; baseline digests and PSNR recorded in `expected/metrics.json`.
- Stop conditions: download or SHA mismatch; CLI unable to run headless (record as blocked); repeat run not identical (fail).
- Reproduce: `./run.sh --record` after inspection, then `./run.sh` prints `ntsc-rs-vhs-preset: OK`.

## Observation, after running

Run 2026-11-27 on `Conors-MacBook-Pro-2.local` (macOS 26, arm64), ntsc-rs 0.9.7, by the onboarding worker.

- All predeclared checks passed on the first recorded run: 10 frames, 320x240 FFV1, a == b frame by frame, 10 of 10 frames differ under seed 4321, PSNR 12.7 dB against the source.
- Visual inspection (frame 5 of each, 2x nearest-neighbour): the source is flat testsrc colour bars; the output has smeared, bleeding chroma, cross-hatch dot crawl, ghosted vertical edges, a white scanline speck and a band of coloured tracking noise at the bottom. Clearly analogue-looking and degraded.
- Deviation: `-c png` with a `#`-numbered output failed with "Failed to insert sink" in this bundle, so frames are taken from FFV1 via ffmpeg. This is a tool limitation for this route, not tested further. The first preset I wrote used nested objects and was rejected ("comma or end of sequence expected"); the flat form above parses.
- The preset is a hand-written subset, not a preset exported from the GUI; unspecified settings take legacy defaults.

What this establishes: on this machine, ntsc-rs 0.9.7's CLI runs headless from an unpacked official pkg and renders a deterministic, seed-dependent, visibly degraded clip from a JSON preset.

What it does not establish: determinism across machines, versions or thread counts (hashes are host-specific), fidelity to real tape, the PNG, H.264 and still-image routes, the GUI, OpenFX or After Effects plugins, or audio handling.
