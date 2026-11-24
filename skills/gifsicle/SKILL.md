---
name: gifsicle
description: Optimise or edit an existing animated GIF with the gifsicle CLI, keeping frame timing and loop. Load after a GIF exists (from gifski or FFmpeg) and its size needs trimming.
---

# Gifsicle

`vcr` below means `node <plugin-root>/cli/vcr.mjs`; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Gifski or FFmpeg makes the GIF; gifsicle optimises or edits one that already exists. Use it as the last step before delivery. Whether a GIF is the right destination, and its size limits, are delivery decisions: see `DELIVERY-FILESIZE-PLATFORM` and `DELIVERY-LOOP-SEAM` (`vcr rules info <ID>`).
- Per-frame delays: gifski cannot vary them, so the fixture input comes from FFmpeg. FFmpeg's GIF output rounds delays to its 1/25 s grid (4 cs steps) unless the concat list sets durations, and a repeated last file becomes an extra frame. Check frame count and delays on the input before optimising.
- Evidence covers gifsicle 1.98 (upstream is now 1.99, untested) on macOS arm64, one 6-frame 64×64 FFmpeg GIF with no transparency. Other encoders, alpha, disposal methods, other lossy levels or colour counts and the editing modes are untested.
- Licence GPL-2.0; check obligations before bundling the binary.

## Capability map
Documented, from the [manual](https://www.lcdf.org/gifsicle/man.html):
- **Optimisation:** `-O1`/`-O2`/`-O3`, `--colors`, `--lossy`, `--dither`. Tested: `-O3`, `--colors=16`, `--lossy=80` on one input.
- **Editing:** frame selection, `--crop`, `--resize`, `--delay`, `--loopcount`, `--transparent`. Untested.
- **Combining and exploding:** merge several GIFs, `--explode`. Untested.
- **Inspection:** `--info`, `--color-info`. Untested; the fixture reads GIF blocks with its own checker.

## Install and doctor
```sh
brew install gifsicle
gifsicle --version
```
`vcr doctor` runs the record's `gifsicle --version` probe. The fixture also needs `ffmpeg`, ImageMagick (`magick`) and Python 3.

## Smoke test
```sh
vcr example create gifsicle-optimise
cd examples/gifsicle-optimise && ./run.sh
# expect: gifsicle-optimise: OK
```
Exact byte sizes are in `expected/metrics.json`, which `run.sh` diffs against.

## Recipes (tested on the fixture)
```sh
gifsicle -O3 in.gif -o out.gif                # lossless
gifsicle -O3 --colors=16 in.gif -o small.gif  # smaller, lossy
gifsicle -O3 --lossy=80 in.gif -o lossy.gif   # lossy
```
- `-O3` was lossless here: 12479 to 10869 bytes, same 6 frames, delays (12, 24, 4, 16, 28, 4 cs), loop count and decoded RGBA frames (ImageMagick coalesced); a repeat run was byte-identical (`DELIVERY-CHECKSUM` style comparison with `cmp`).
- `--colors=16`: 4929 bytes, every colour table at most 16 entries, timing kept. Visible cost: the gradient background showed heavy banding and speckle (`DELIVERY-BANDING`, `DELIVERY-DITHER`). Judge by eye; only the table bound and size were asserted.
- `--lossy=80`: only 58 bytes smaller than `-O3` on this input, so no size benefit is established. Pixels were not asserted (0 of 6 frames identical).
- Always compare frame count, delays and loop after any edit; do not assume they survive.

## Troubleshooting
- Input has 7 frames, not 6: the concat list repeated the last file for its duration. Leave the last entry without a duration line.
- Delays differ from the plan: FFmpeg's GIF grid is 1/25 s; set durations on that grid.
- `--colors` result looks banded: raise the colour count or skip it; this fixture does not tune palette quality.

## Official docs
- [Repository](https://github.com/kohler/gifsicle), [manual](https://www.lcdf.org/gifsicle/man.html), [NEWS](https://github.com/kohler/gifsicle/blob/master/NEWS.md); fixture run 2026-11-24, tested gifsicle 1.98.
