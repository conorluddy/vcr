---
name: libavif
description: Encode a PNG still to AVIF with avifenc and decode it back with avifdec. Load when AVIF output or an AVIF input is needed; evidence is partial, so read the alpha warning first.
---

# libavif

`vcr` below means `node <plugin-root>/cli/vcr.mjs`; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Use `avifenc` to turn a PNG still into AVIF and `avifdec` to read it back to PNG. Evidence is **partial**: one lossless leg and one lossy leg on a single generated 64×64 RGBA image, macOS arm64, libavif 1.4.2 (aom 3.15.3 encoder, dav1d 1.5.4 decoder).
- **Alpha warning.** Lossy encoding (`-q 60 --qalpha 60`) did not reach full opacity: the decoded alpha maximum was 254, not the 255 in the source. Lossless (`-l`) kept alpha 0 to 255 exactly. For compositing, prefer lossless, or decode and measure alpha before trusting a lossy file. Whether a higher `--qalpha` fixes it is untested.
- Not tested: animation and PNG sequences, HDR, 10/12-bit, ICC profiles, other decoders or backends, other platforms and versions, speed and file-size trade-offs, perceptual quality beyond one PSNR figure.
- Delivery of stills (format choice, sRGB, alpha) is owned by the delivery pillar: see `DELIVERY-STILL-FORMAT`, `DELIVERY-STILL-SRGB` and `DELIVERY-MASTER-ALPHA` (`vcr rules info <ID>`). The fixture meets none of them: it never checks a destination's AVIF acceptance or colour profile. Keep a lossless PNG master.
- For WebP use libwebp; for sequences and muxing use FFmpeg.

## Capability map
Discoverability only; the fixture covers just the marked parts.
- **Encoding (`avifenc`)**: [README and usage](https://github.com/AOMediaCodec/libavif#readme), `avifenc --help`. Tested: PNG input, `--codec aom`, `-j 1`, `-s 6`, `-l`, `-q`, `--qalpha`. Untested: animation, other codecs, depth, YUV format, ICC and grid options.
- **Decoding (`avifdec`)**: `avifdec --help`. Tested: AVIF to PNG with dav1d. Untested: other output formats and decoders.
- **C library**: [headers](https://github.com/AOMediaCodec/libavif/blob/main/include/avif/avif.h). Untested.

## Install and doctor
```sh
brew install libavif
avifenc --version
```
`vcr doctor` runs the record's `avifenc --version` probe; it does not check `avifdec` or ImageMagick, which the fixture also needs. Run `vcr doctor` to see what is installed.

## Smoke test
```sh
vcr example create libavif-still-roundtrip
cd examples/libavif-still-roundtrip && ./run.sh
# expect (current, partial): predeclared checks FAILED (exit 1)
```
The fixture deliberately exits non-zero: 8 of 9 checks pass and `lossy_alpha_range_0_to_255` fails. It does not print `OK` until that is resolved. Recorded values (`expected/metrics.json`):
- Lossless: 64×64, decode pixel-identical to the source (RGBA SHA-256 match), alpha 0 to 255, 604 bytes.
- Lossy: 64×64, alpha 0 to 254 with 17 levels, PSNR 52.2968 dB over RGBA, 590 bytes.
- Repeat runs were byte-identical on this machine.

## Recipes
Commands as run:
```sh
avifenc --codec aom -j 1 -s 6 -l in.png out.avif                  # lossless
avifenc --codec aom -j 1 -s 6 -q 60 --qalpha 60 in.png out.avif   # lossy, alpha tops out at 254
avifdec -j 1 out.avif out.png
```
Pin codec and speed for repeatable output; byte stability across versions is untested. To verify alpha, decode and read the channel range, for example `magick out.png -alpha extract -format "%[min] %[max]" info:`.

## Troubleshooting
- Alpha max is 254 after a lossy encode: seen. Use `-l`, or measure before compositing.
- `run.sh` exits 1 with no `OK`: expected while the lossy alpha check fails; inspect `output/metrics.json` against `expected/`.

## Official docs
- [libavif repository](https://github.com/AOMediaCodec/libavif) and [releases](https://github.com/AOMediaCodec/libavif/releases); fixture checked 2026-11-24, tested 1.4.2.
