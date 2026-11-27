---
name: libultrahdr
description: Encode an SDR plus HDR pair into an Ultra HDR JPEG (SDR base with a gain map) with ultrahdr_app, probe it and decode it back. Load when an HDR still must fall back to SDR; evidence is partial, so read the metadata warning first.
---

# libultrahdr

`vcr` below means `node <plugin-root>/cli/vcr.mjs`; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- `ultrahdr_app` writes one JPEG holding an SDR base and a gain map, and decodes it back to HDR pixels. Evidence is **partial**: one synthetic 128x96 pair (HLG, P3 HDR input; sRGB SDR input), Homebrew 2.0.2, macOS arm64.
- **Metadata warning.** 2.0.2 wrote ISO 21496-1 gain map metadata (APP2 `urn:iso:std:iso:ts:21496:-1`) in both images plus MPF, and **no XMP** (`hdrgm:*` absent). A reader that only understands Google's XMP form may show the SDR base only. Untested in any browser or phone.
- Verified: a plain JPEG reader (ImageMagick, ffmpeg) decodes the SDR base; the library probe reports `maxContentBoost` and decode recovers highlights; a plain JPEG is rejected by the probe.
- Not tested: HDR display, PQ or linear input, P010, encoding from an existing SDR JPEG, noisy photos, gain map downsampling, AVIF/HEIC output, other writers.
- For AVIF stills use libavif; for HDR in video streams use dovi-tool. Keep the raw HDR source: the SDR base is lossy.

## Capability map
- **Encode (`-m 0`)**: scenarios by inputs: raw HDR+SDR (`-p -y`), raw HDR alone (`-p`), raw HDR + SDR JPEG (`-p -i`), SDR JPEG + gain map JPEG. Tested: raw HDR + raw SDR only.
- **Decode (`-m 1`)**: `-P` probe prints gain map metadata; `-o`/`-O` choose output transfer and format. Tested: probe, HLG RGBA1010102, sRGB RGBA8888.
- **Flags** live in `ultrahdr_app -h` and [examples/ultrahdr_app.cpp](https://github.com/google/libultrahdr/blob/main/examples/ultrahdr_app.cpp).
- **C/C++ library**: [repository](https://github.com/google/libultrahdr). Untested.

## Install and doctor
```sh
brew install libultrahdr
ultrahdr_app -h 0
```
`-h` needs an argument, so `-h 0` prints the usage. The fixture also needs exiftool, ImageMagick, ffmpeg and python3 with numpy.

## Smoke test
```sh
vcr example create libultrahdr-gainmap-encode
cd examples/libultrahdr-gainmap-encode && ./run.sh
# expect: KNOWN FAIL: xmp_hdrgm_gain_map_max_present, then "9 of 10 predeclared checks pass", then OK
```
Recorded: 7410-byte file, gain map 4024 bytes, SDR base 50.39 dB PSNR vs input, maxContentBoost 9.462, byte-identical on repeat.

## Recipes
Raw inputs are headerless, so width, height and formats are flags. Little-endian RGBA1010102 for `-a 5`, RGBA8888 for `-b 3`:
```sh
ultrahdr_app -m 0 -w 128 -h 96 -p hdr.rgba1010102 -a 5 -t 1 -C 1 -y sdr.rgba8888 -b 3 -c 0 -z out.jpg
ultrahdr_app -m 1 -P -j out.jpg                                  # probe; exit 255 if no gain map
ultrahdr_app -m 1 -j out.jpg -o 1 -O 5 -z hdr.rgba1010102        # HDR (HLG) back
exiftool -MPF:NumberOfImages out.jpg                            # 2 expected
exiftool -b -MPImage2 out.jpg > gainmap.jpg                     # extract the gain map
```

## Troubleshooting
- `option -h requires an argument`: seen; `-h` is image height in encode mode and needs a value.
- Probe says `input uhdr image does not contain gainmap image` (exit 255): the file is a plain JPEG.
- Hash or size differs on another machine: output depends on the libjpeg-turbo build (3.2.1 here).

## Official docs
- [libultrahdr](https://github.com/google/libultrahdr), [releases](https://github.com/google/libultrahdr/releases), [Android Ultra HDR format](https://developer.android.com/media/platform/hdr-image-format); tested 2.0.2 on 2026-11-27.
