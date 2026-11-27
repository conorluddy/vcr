---
name: halftone-converter
description: Render a still as round-dot halftones with halftone-converter's `halftonecv` CLI, with a screen angle per CMYK plate. Load for a print-process look that needs real screen angles; use imagemagick for plain dither.
---

# halftone-converter (`halftonecv`)

## Use cases and limits

Turns one still into a Cairo-drawn dot screen (gray, RGB or CMYK). One process per image, so per-frame video use is slow; treat source stills, not footage. AGPL-3.0-or-later: run it as a CLI, do not bundle it. Dots are round only; there is no shape option. Not for ordered dither or threshold looks (`imagemagick`, `g-mic`).

## Capability map

Documented in the package README ([repo](https://github.com/curegit/halftone-converter)): pitch `-p`, scale `-x`, blur `-b`/`-B`, resampling `-F`, angles `-A` (gray), `-t` (RGB), `-a` (CMYK), mode `-m`, output `-o`/`-T`, ICC profiles and intents (`-G -I -M -L -R -C`, defaults sRGB, sGray, SWOP), `--keep-*` per channel, `--naive` conversion, stdin/stdout, globbing.

Tested in VCR: `-p`, `-x`, `-A`, `-a`, `--keep-*`, `--discard`, `-d`, `-f`. Untested: RGB mode, custom ICC, blur, TIFF/CMYK output, alpha, photos.

## Install and doctor

```sh
python3.12 -m venv venv && venv/bin/pip install halftone-converter==2.6.14
venv/bin/halftonecv --version   # 2.6.14
```

The entry point is `halftonecv`, not `halftone-converter`. pycairo ships a wheel; no system Cairo was needed on macOS arm64. `vcr doctor` does not check it.

## Smoke test

```sh
examples/halftone-screen-separation/run.sh
# expect: halftone-screen-separation: OK
```

## Recipes

```sh
# gray, 45 degree screen, 8 px pitch, 2x output
halftonecv -q -f -p 8 -x 2 -A 45 -d out in.png      # out/in-halftone.png
# CMYK screens 15/75/0/45; keep-flags show only the Cyan plate halftoned
halftonecv -q -f -a 15 75 0 45 --keep-magenta --keep-yellow --keep-key -d out in.png
```

Measured: dot lattice angle within 1 degree of the asked angle, period about 2x pitch at `-x 2` (15.74 px for 16 expected). Output is byte-identical on repeat.

## Troubleshooting

- `-o cmyk` writes the rendered image as a TIFF, not separated plates.
- Saturated colours (pure red) saturate M and Y to solid; only C shows dots. Use mid-tones to see every plate.
- Very light colours leave the K plate nearly empty.
- `--discard` drops the embedded profile; leave it off when the profile matters.
- A venv built under a sandboxed temp path failed to load Pillow dylibs (code-signature policy); build it in the repository's `output/`.

## Official docs

- https://github.com/curegit/halftone-converter
- https://pypi.org/project/halftone-converter/2.6.14/
