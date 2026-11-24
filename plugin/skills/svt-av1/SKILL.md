---
name: svt-av1
description: Encode Y4M or raw YUV video to AV1 (IVF or OBU) with the standalone SvtAv1EncApp CLI. Load when AV1 delivery is wanted and you have chosen the SVT-AV1 encoder; for broad playback compatibility use FFmpeg with H.264 or H.265.
---

# SVT-AV1

`vcr` below means `node <plugin-root>/cli/vcr.mjs`; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Use SvtAv1EncApp to turn a finished opaque Y4M (for example from `ffmpeg`) into an AV1 IVF at a chosen preset and CRF. Delivery targets, chroma, range and bitrate choices belong to the delivery pillar (`vcr rules info DELIVERY-CHROMA-SUBSAMPLING`, `DELIVERY-RANGE-LIMITED`, `DELIVERY-CHECKSUM`); this guide does not restate them.
- The VCR fixture validates one case: 48 frames of 1280x720 8-bit yuv420p Y4M (FFmpeg `testsrc2`), preset 8, CRF 35, to IVF, on macOS arm64 with SvtAv1EncApp 4.3.0 (FFmpeg 9.0.2 for source, probe and decode). It does not test alpha, 10-bit, 2-pass or bitrate modes, other presets or CRF values, natural footage, playback compatibility, or FFmpeg's `libsvtav1` route.
- No alpha: use ProRes 4444 through the `ffmpeg` guide when transparency must survive.
- Licence: code is BSD-3-Clause-Clear, but the AOM Patent License 1.0 applies separately. The fixture makes no patent or licence claim; check the terms for your distribution.

## Capability map
Discovery only; the official docs and `SvtAv1EncApp --help` are authoritative.
- **I/O (tested):** `-i` Y4M or YUV (also stdin), `-b` output; IVF is the default, `--obu` writes raw OBU. Tested: Y4M in, IVF out. Raw YUV, pipes and OBU are untested.
- **Speed and quality (partly tested):** `--preset` (-1 to 13, higher is faster) and `--crf`. Tested at preset 8, CRF 35 only.
- **Rate control and passes (untested):** `--rc`, `--tbr`, `--passes`, `--stats`; see the [user guide](https://gitlab.com/AOMediaCodec/SVT-AV1/-/blob/master/Docs/Parameters.md).
- **Fine parameters (untested):** `--svtav1-params key=value:...`, config files with `-c`, colour metadata (`--color-help`), 10-bit input, `--enable-stat-report` and `--recon`.
- **Library and FFmpeg `libsvtav1` (untested):** the C encoder library and FFmpeg's wrapper are separate routes.

## Install and doctor
```sh
brew install svt-av1
SvtAv1EncApp --version
```
`vcr doctor` runs the record's check command. The fixture also needs `ffmpeg`, `ffprobe`, `jq` and `shasum`; check them with `vcr doctor`. Installation is not implied by this guide.

## Smoke test
```sh
vcr example create svt-av1-encode
cd examples/svt-av1-encode && ./run.sh
# expect: svt-av1-encode: OK
```
Before it, a line like `psnr_average_db=43.05... encoded_sha256=... identical=yes` prints. The run checks that ffprobe reports `av1`, 1280x720, yuv420p, 48 frames (diffed against `expected/ffprobe.json`) and that decoded PSNR against the source stays above the floor in `expected/quality.json`. The recorded sample was 43.05 dB; the floor is a loose gate, not a quality claim. Two encodes were byte-identical here (621,376 bytes); that is recorded, not gated.

## Recipe
```sh
ffmpeg -y -f lavfi -i testsrc2=size=1280x720:rate=24 -frames:v 48 -pix_fmt yuv420p source.y4m
SvtAv1EncApp -i source.y4m -b encoded.ivf --preset 8 --crf 35 > svt.log 2>&1
ffprobe -v error -count_frames -select_streams v:0 \
  -show_entries stream=codec_name,width,height,nb_read_frames,pix_fmt -of json encoded.ivf
```
Count frames with `-count_frames` (packets): ffprobe does not report the IVF header frame count. Write the encoder log to a file; progress is noisy.

## Troubleshooting
- Fixture output differs in bytes after a version or machine change: compare ffprobe fields and PSNR, not the hash. Identity was seen only on one machine in one session.
- PSNR line is empty: the fixture greps the last `average:` from FFmpeg's `psnr` filter at info level; do not pass `-loglevel error` to that command.
- The card recorded 4.2.0 at assessment; the fixture ran 4.3.0. Re-run the example after upgrading.

## Official docs
- [SVT-AV1 repository](https://gitlab.com/AOMediaCodec/SVT-AV1), [parameters](https://gitlab.com/AOMediaCodec/SVT-AV1/-/blob/master/Docs/Parameters.md) and [licence](https://gitlab.com/AOMediaCodec/SVT-AV1/-/blob/master/LICENSE.md); fixture checked 2026-11-24, tested 4.3.0 (the Parameters link follows master, not 4.3.0).
