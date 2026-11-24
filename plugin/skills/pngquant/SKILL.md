---
name: pngquant
description: "Unproven in VCR: lossy PNG palette quantisation with alpha via pngquant; the only fixture failed its quality floor, so treat every recipe here as documentation-only."
---

# pngquant (unproven)

`vcr` below means `node <plugin-root>/cli/vcr.mjs`; inside the VCR repository it is `pnpm vcr`.

## Status

**Unproven.** No passing evidence. The record stays `not-validated`, `documentation_status: listed-in-prd`.

- Recorded fail, `examples/pngquant-palette-quantise/` (pngquant 3.0.3, macOS arm64, 2026-11-24): a generated 256x256 RGBA gradient to 64 colours with `--quality 70-95 --speed 1` exited 99. pngquant reported `MSE=15.604 (Q=54) exceeded limit of 9.511 (70)`. No palette was written, so size, alpha and determinism were never checked in the predeclared run.
- Cause: the quality floor (minimum 70) was too strict for a smooth two-axis gradient squeezed into 64 colours. This is a property of the plan, not evidence that the tool is broken.
- Next fixture to try: a predeclared run with more colours (for example 256) or a flat, few-colour source (UI art, logo, sprite sheet), a floor chosen from a no-floor measurement, and size and alpha gates declared up front. A gradient is the worst case for a palette; do not reuse it as the pass case.

## Use cases and limits
- Intended job: shrink flat or limited-palette PNG stills and sprites for web delivery when controlled colour loss is acceptable and alpha must survive. Choosing PNG for a still is a delivery decision (`DELIVERY-STILL-FORMAT`); dithering and banding risk are covered by `DELIVERY-DITHER` and `DELIVERY-BANDING`.
- Lossy. Never run it on masters or fixtures; quantise copies and keep the originals. Record checksums of delivered files per `DELIVERY-CHECKSUM`.
- Not for pixel-identical recompression: use oxipng. Not for photographs where size matters: use libwebp. Not for animation: gifsicle.
- Untested in VCR: everything except the failed invocation above.

## What the failed fixture taught
Observed in the failed fixture (pngquant 3.0.3):
- The colour count is a positional argument (`pngquant ... 64 -- in.png`); `--ncolors 64` was rejected.
- `--quality MIN-MAX` is a gate: when the result would fall below MIN, pngquant exits 99 and writes nothing.
- Unrecorded diagnostic at `--quality 0-100`, 64 colours: exit 0, 14,817 B against a 1,754 B source (output larger), alpha range 3/255 to 244/255 (fully transparent and fully opaque pixels not preserved), PSNR 31.17 dB, SSIM about 0.81 as read from ImageMagick, Floyd-Steinberg speckle visible across the gradient, two runs byte-identical.
- Not established: behaviour on photographs, other colour counts, other versions, other platforms.

Treat the diagnostic as a warning, not a measurement: a smooth gradient PNG can already be tiny, so quantising can grow it.

## Capability map
From the [official README](https://github.com/kornelski/pngquant/blob/main/README.md) and `pngquant --help`; documentation-only, untested in VCR except the exit-99 behaviour above.
- **Colour count:** positional `[ncolors]` (2 to 256).
- **Quality gate:** `--quality min-max` (0 to 100); `--skip-if-larger`.
- **Dithering:** default Floyd-Steinberg; `--nofs` disables; `--floyd=` strength.
- **Speed:** `--speed 1..11` (1 slowest, best).
- **Output:** `--output file`, `--ext`, `--force`, `--strip`, stdin/stdout with `-`.
- **Library:** libimagequant (embeddable).

## Install and doctor
```sh
brew install pngquant
pngquant --version
```
The record's check command is `pngquant --version`; `vcr doctor` does not probe candidates. The record's 3.0.4 comes from upstream `snapcraft.yaml`; the fixture ran 3.0.3.

## Smoke test
```sh
vcr example create pngquant-palette-quantise
cd examples/pngquant-palette-quantise && ./run.sh
# expect today: exit 99 (the recorded failure); the OK line appears only after a new passing plan
```

## Recipe (documentation-only, untested in VCR)
```sh
pngquant --quality 0-100 --speed 1 --force --output out/sprite.png 256 -- in/sprite.png
```
Then compare against the original (dssim, or ImageMagick `compare`), check the alpha range, and keep the smaller of the two files. Only add a `--quality` floor after measuring what a no-floor run scores.

## Validated neighbours to use today
- oxipng: lossless PNG recompression (`skills/oxipng/SKILL.md`).
- libwebp: smaller lossy or lossless stills with alpha (`skills/libwebp/SKILL.md`).
- gifsicle: palette-limited animation (`skills/gifsicle/SKILL.md`).
- dssim: score the quantised still against the original (`skills/dssim/SKILL.md`).

## Troubleshooting
- Exit 99: the `--quality` minimum was not reachable. Lower MIN, raise the colour count, or change the source. Observed in the failed fixture.
- Output larger than source: observed in the diagnostic on a gradient; `--skip-if-larger` is documented (untested) or keep the original.

## Official docs
- [pngquant.org](https://pngquant.org/) and [README](https://github.com/kornelski/pngquant/blob/main/README.md)
- Licence: GPL-3.0-or-later with an additional legacy copyright notice; a commercial licence is offered (per the README; text not read in full). Check before bundling in a distributed product.
