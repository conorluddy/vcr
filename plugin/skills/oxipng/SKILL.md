---
name: oxipng
description: Losslessly recompress PNG stills and frames with oxipng, with optional metadata stripping. Load when PNG size matters but decoded pixels and alpha must not change.
---

# oxipng

`vcr` below means `node <plugin-root>/cli/vcr.mjs`; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Use oxipng on PNG stills, frames or sprite assets where a smaller file is wanted and the decoded image must stay identical. Choosing PNG for flat or typographic stills is a delivery decision (`DELIVERY-STILL-FORMAT`); oxipng only shrinks the file once PNG is chosen. Record checksums of the optimised files per `DELIVERY-CHECKSUM`.
- For lossy palette reduction use pngquant; for transforms, resizing or format conversion use ImageMagick.
- Evidence covers six generated 64x64 PNGs (three 8-bit RGBA with gradient alpha, three 8-bit palettes with `tRNS`) at `-o 4` with `--strip safe`, oxipng 10.1.0, macOS arm64. Observed: decoded RGBA identical (checked through ImageMagick), no file grew, `tEXt`, `zTXt`, `iTXt` and `tIME` removed, `pHYs`, `PLTE` and `tRNS` kept, repeat run byte-identical. Palette outputs dropped from 8-bit to 2-bit depth.
- Not tested: other `-o` presets, `--alpha`, `--interlace`, `--fix-errors`, 16-bit, greyscale, APNG, real-world assets, speed, other systems. The sample saving (32671 to 1120 bytes) comes from tiny synthetic images; do not expect it on real frames.
- `--strip safe` help text does not list `tRNS` as kept, yet it survived and alpha was unchanged. Treat as observed, not guaranteed; re-check decoded alpha on palette art.

## Capability map
Discoverability from the [official README](https://github.com/oxipng/oxipng) and `oxipng --help`, not VCR validation.
- **Optimisation presets (`-o 0..6`, `max`):** trade speed for size. Tested: `-o 4` only.
- **Metadata (`--strip safe|all`, `--keep`):** tested: `safe` only.
- **Output control (`--out`, `--dir`, `--stdout`, `-r`, `--dry-run`, `-p`):** tested: `--out` with `-q`. Without `--out` or `--dir` the input is overwritten.
- **Pixel-changing options (`--alpha`, `--interlace`, bit-depth and colour-type reduction):** untested except the automatic palette depth reduction observed above.
- **Library:** Rust crate, untested.

## Install and doctor
```sh
brew install oxipng
oxipng --version
```
`vcr doctor` runs the record's `oxipng --version` probe. The fixture also needs `magick` (decoder) and `python3`.

## Smoke test
```sh
vcr example create oxipng-lossless-optimise
cd examples/oxipng-lossless-optimise && ./run.sh
# expect: oxipng-lossless-optimise: OK
```
It generates six PNGs, optimises each with and without `--strip safe`, repeats the safe run, and diffs `output/metrics.json` against `expected/metrics.json` (sizes, chunk lists, decoded hashes).

## Recipe
```sh
oxipng -q -o 4 --strip safe --out out/frame.png in/frame.png
```
Verify before shipping: compare decoded RGBA hashes of input and output (`magick f.png -depth 8 RGBA:- | shasum -a 256`). Keep originals; optimise copies.

## Troubleshooting
- Input overwritten: you omitted `--out` or `--dir`. Restore from the original.
- Palette frame looks different: do not assume `tRNS` survives; compare decoded RGBA with the check above.
- Output depth changed (`magick identify`): expected, oxipng reduces bit depth losslessly; pixels stay the same.

## Official docs
- [oxipng repository and README](https://github.com/oxipng/oxipng); fixture checked 2026-11-24, tested oxipng 10.1.0.
