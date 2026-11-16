---
name: gifski
description: Encode PNG frame sequences or Y4M input into high-quality animated GIFs with temporal dithering. Load when GIF quality matters more than smallest file size.
---

# Gifski

`vcr` below means `node <plugin-root>/cli/vcr.mjs`; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Use Gifski after a renderer has produced PNG frames and you need a high-quality GIF. It builds palettes across frames and applies temporal dithering.
- For smaller files, compare a tuned FFmpeg palette workflow or use a video format when delivery permits. The VCR fixture validates three opaque 64×64 RGB PNGs at 3 fps on macOS arm64 with Gifski 1.34.0. It does not test alpha, Y4M/video input, large-image downscaling, alternate quality settings or other systems.
- Gifski is AGPL-3.0-or-later. Commercial terms are offered upstream, but the free software remains available under AGPL; evaluate your distribution obligations for the project using it.

## Capability map
- **CLI input and output:** the [official README](https://github.com/ImageOptim/gifski#usage) documents PNG sequences and Y4M input, `-o` output, sizing and quality options. VCR exercises PNG input and a GIF output.
- **Encoding controls:** `--fps`, `--quality`, width and height are documented in the [CLI README](https://github.com/ImageOptim/gifski#tips-for-smaller-gif-files) and `gifski --help`. The fixture checks 3 fps at quality 100; other settings and alpha behavior are untested.
- **Library interfaces:** Gifski also exposes a C API; see the [API header](https://github.com/ImageOptim/gifski/blob/main/gifski.h). VCR does not test that interface.

## Install and doctor
```sh
brew install gifski
gifski --version
```
`vcr doctor` checks the executable using the record's `gifski --version` probe. The fixture also needs `ffprobe` for metadata checks; inspect it separately with `vcr doctor`.

## Smoke test
```sh
vcr example create gifski-sequence
cd examples/gifski-sequence && ./run.sh
# expect: gifski-sequence: OK
```
The fixture generates three PNGs, encodes them twice and checks the 64×64 GIF, three frame timestamps (0.00, 0.33, 0.67 seconds), one-second duration and byte-identical repeat. The byte count and hash are retained in `expected/metrics.json`; the success line is stable.

## Troubleshooting
- If `gifski` cannot read frames, pass an unquoted shell glob such as `frame*.png`; quoting the asterisk prevents shell expansion.
- If FFprobe reports `100/33` instead of exactly `3/1`, use the frame timestamps and total duration. GIF stores timing in hundredths of a second.
- If the GIF is too large, reduce dimensions first, then tune quality. These changes alter output and must not be treated as the fixture's validated settings.

## Official docs
- [Gifski README and CLI guide](https://github.com/ImageOptim/gifski) and [releases](https://github.com/ImageOptim/gifski/releases); fixture checked 2026-11-15, tested Gifski 1.34.0.
