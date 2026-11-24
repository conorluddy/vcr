---
name: libwebp
description: Encode and decode WebP stills losslessly and assemble animated WebP from PNG frames with the libwebp command-line tools. Load when a WebP still or animation with alpha is the target.
---

# libwebp

`vcr` below means `node <plugin-root>/cli/vcr.mjs`; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Use it when a platform accepts WebP and a lossless still, or a small animated WebP with alpha, is needed from PNG frames. Whether WebP is the right format for a destination is a delivery decision: check `DELIVERY-STILL-FORMAT` and `DELIVERY-STILL-SRGB` (`vcr rules info <ID>`) rather than assuming.
- For video, or broader conversion and muxing, use FFmpeg; for AVIF use libavif.
- Tested: macOS arm64, libwebp 1.6.0 (`cwebp`, `dwebp`, `img2webp`, `webpmux`). Three generated 64x64 RGBA PNGs with alpha values 0, 128 and 255 round-trip pixel-identically through `cwebp -lossless` and `dwebp -pam`. `img2webp` wrote a 3-frame animation whose `webpmux -info` reports 100, 250 and 400 ms durations, and a repeat run was byte-identical.
- Not tested: lossy encoding, `-exact` (the fixture's transparent pixels are `0,0,0,0`, so RGB under alpha 0 is not proven preserved), pixel fidelity of the animation itself, `gif2webp`, other versions or platforms, and how browsers render the file.

## Capability map
Discoverability only; the tested parts are marked.
- **`cwebp`** encode PNG/JPEG/TIFF to WebP, lossy or lossless, with alpha controls ([manual](https://developers.google.com/speed/webp/docs/cwebp)). Tested: `-quiet -lossless` on RGBA PNG.
- **`dwebp`** decode to PNG, PAM, PPM and others ([manual](https://developers.google.com/speed/webp/docs/dwebp)). Tested: `-pam` (keeps RGBA).
- **`img2webp`** assemble frames into an animation, with per-frame `-d` and global `-loop` ([manual](https://developers.google.com/speed/webp/docs/img2webp)). Tested: `-loop 0 -lossless` with three `-d` values.
- **`webpmux`** inspect (`-info`) or edit WebP containers, frames, metadata ([manual](https://developers.google.com/speed/webp/docs/webpmux)). Tested: `-info` only.
- **`gif2webp`** GIF to animated WebP ([manual](https://developers.google.com/speed/webp/docs/gif2webp)). Untested.
- **`vwebp`, `webpinfo`, C API** viewer, bitstream dump and library ([API](https://developers.google.com/speed/webp/docs/api)). Untested.

## Install and doctor
```sh
brew install webp
cwebp -version
```
`vcr doctor` runs the record's `cwebp -version` probe. That checks `cwebp` only; confirm `dwebp`, `img2webp` and `webpmux` the same way. The fixture also needs ImageMagick (`magick`) and `python3`.

## Smoke test
```sh
vcr example create libwebp-lossless-animation
cd examples/libwebp-lossless-animation && ./run.sh
# expect: libwebp-lossless-animation: OK
```
The fixture generates the frames, checks raw RGBA SHA-256 equality for each round trip, the 64x64 canvas, 3 frames, `animation transparency` features, durations 100/250/400 and a byte-identical repeat (260 B). Hashes and versions are in `expected/metrics.json`.

## Recipes
Verified by the fixture:
```sh
cwebp -quiet -lossless frame.png -o still.webp
dwebp -quiet -pam still.webp -o still.pam
img2webp -loop 0 -lossless -d 100 f0.png -d 250 f1.png -d 400 f2.png -o animation.webp
webpmux -info animation.webp
```
`-d` precedes the frame it applies to. Compare decodes by hashing raw RGBA (`magick in -depth 8 rgba:-`), not file bytes. To view animation frames, `magick animation.webp -coalesce`; do not `-flatten` the result, which merges frames.

## Troubleshooting
- `webpmux -info` on a still does not print the word `alpha` as a feature; look for `Features present: transparency` and `Size of the image (with alpha)`.
- A still with transparency has RGB under alpha 0 that the encoder may change without `-exact`; this fixture cannot tell, so test your own assets.
- If PNG input is not RGBA (colour type 6), force it when generating frames (`-define png:color-type=6` in ImageMagick) before judging alpha.

## Official docs
- [WebP tools](https://developers.google.com/speed/webp/docs/using) and [libwebp source](https://chromium.googlesource.com/webm/libwebp), [v1.6.0 tag](https://chromium.googlesource.com/webm/libwebp/+/refs/tags/v1.6.0); fixture checked 2026-11-24, tested libwebp 1.6.0.
