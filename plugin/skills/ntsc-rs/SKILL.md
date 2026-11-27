---
name: ntsc-rs
description: Apply a seeded analogue NTSC/VHS look to a video with ntsc-rs-cli and a JSON preset. Load once ntsc-rs has been chosen to degrade clean generated footage; the tested route is the macOS pkg unpacked into a project folder.
---

# ntsc-rs

`vcr` below means `node <plugin-root>/cli/vcr.mjs`; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Renders the analogue signal path (composite noise, chroma bleed, tracking noise, head switching, tape speed) onto existing video. Use `frei0r` or `g-mic` for plain filter effects, FFmpeg for everything around it.
- Evidence: ntsc-rs 0.9.7 on macOS arm64, a 10-frame 320x240 FFmpeg `testsrc` clip, FFV1 output. Same preset and seed gave identical frames on the same host; another seed changed all frames. Cross-machine determinism is untested.
- Licence of the code: MIT OR ISC OR Apache-2.0. The macOS bundle also carries GStreamer; check its terms before redistributing the bundle.

## Capability map
Documented at [ntsc.rs](https://ntsc.rs) and in the repository:
- **`ntsc-rs-cli`:** `-i`, `-o`, `-p` preset file or `-j` JSON string, `--scale`, `--interlace`, `-c h264|ffv1|png`, still-image input with `--fps` and `--duration`. Tested: `-i`, `-o`, `-p`, `-c ffv1`.
- **Effect settings:** about 60 ids in `crates/ntscrs/src/settings/standard.rs`. Tested: seed, composite and chroma noise, snow, tracking noise, head switching, VHS tape speed.
- **GUI, OpenFX, After Effects plugins:** untested.

## Install and doctor
No crates.io CLI crate. Download the release pkg, verify its hash, unpack without installing:
```sh
curl -fsSL -o ntsc-rs.pkg https://github.com/ntsc-rs/ntsc-rs/releases/download/v0.9.7/ntsc-rs-macos-standalone.pkg
echo "51ca362a9ce8b40cb47804959cbbdc5bb71e79c0f334542dd85fa27faa04c1e0  ntsc-rs.pkg" | shasum -a 256 -c -
pkgutil --expand-full ntsc-rs.pkg pkg    # CLI: pkg/Payload/ntsc-rs.app/Contents/MacOS/ntsc-rs-cli
```
The record's `ntsc-rs-cli --version` probe only works if that path is on `PATH`; the fixture calls it by path instead.

## Smoke test
```sh
vcr example create ntsc-rs-vhs-preset
cd examples/ntsc-rs-vhs-preset && ./run.sh
# expect: ntsc-rs-vhs-preset: OK
```
It downloads 90 MB on a clean checkout. Exact digests and PSNR are in `expected/metrics.json`.

## Preset and render
Preset JSON is flat: `"version": 1`, group switches as booleans (`"tracking_noise": true`) with their children as flat keys, enums as integers, `"random_seed"` for repeatability. Nested objects fail to parse. See `examples/ntsc-rs-vhs-preset/preset.json`.
```sh
ntsc-rs-cli -i clean.mp4 -o out.mkv -c ffv1 -p preset.json -y
```
Read the result as a frame (`ffmpeg ... -vf select=eq(n\,5)`) before accepting it: here it showed smeared chroma, dot crawl and a coloured tracking band, 12.7 dB PSNR against the source.

## Troubleshooting
- `Failed to parse settings file / comma or end of sequence expected`: preset has nested objects; flatten it.
- `Failed to insert sink` with `-c png`: seen in the 0.9.7 bundle; render FFV1 and extract frames with FFmpeg.
- Input goes through GStreamer; use a common codec (lossless H.264 mp4 worked).

## Official docs
[ntsc.rs](https://ntsc.rs), [repository](https://github.com/ntsc-rs/ntsc-rs), [release v0.9.7](https://github.com/ntsc-rs/ntsc-rs/releases/tag/v0.9.7); fixture run 2026-11-27.
