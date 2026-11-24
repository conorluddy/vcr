---
name: splat-transform
description: "Unproven in VCR: PlayCanvas splat-transform CLI for converting and filtering Gaussian splats; the fixture failed because -t translates in the tool's frame (x and y flipped against the PLY), so every recipe is documentation-only."
---

# splat-transform (unproven)

`vcr` below means `node <plugin-root>/cli/vcr.mjs`; inside the VCR repository it is `pnpm vcr`.

## Status

**Unproven.** No passing evidence. The record stays `not-validated`, `documentation_status: listed-in-prd`.

- Recorded fail, `examples/splat-transform-convert/` (splat-transform 3.12.0, Node 22.19.0, macOS arm64, 2026-11-24): a synthetic 100-splat 3DGS PLY, `-t 10,-2,0.5 -s 2 -V opacity,gt,0.5` to PLY. Input read-back and splat count (60) passed and two PLY runs were byte-identical. Bounds failed: predicted min (20, -4, 1) max (24, 4, 7); measured min (-20, 4, 1) max (-16, 12, 7), error 40 against a 1e-4 tolerance. The compressed PLY and SOG read-backs were never reached in the predeclared run.
- Cause: `-t` acts in the tool's own frame, where x and y are flipped relative to the PLY file for this input. Single-axis diagnostics: `-t 1,0,0` gave x - 1; `-t 0,1,0` gave y - 1; `-t 0,0,1` gave z + 1. The predicted bounds assumed the file frame.
- Next fixture to try: predeclare bounds in the tool's frame (derive the convention from a single-axis test first, or from documentation), then cover compressed PLY and SOG read-back and the SOG rerun at a larger splat count.

## Use cases and limits
- Intended job: scriptable conversion and filtering of Gaussian-splat assets (PLY, compressed PLY, SOG and others) where mesh tools would lose splat data. Pairs with a browser viewer (playwright) for visual checks.
- Not for mesh modelling or rendering (Blender); not for interactive inspection only.
- Coordinate convention is the main trap: do not trust file-frame arithmetic after `-t` or rotation. Verify with a read-back.
- Untested: other input formats, rotate (`-r`), LOD, SOG at scale, GPU paths, library API, other OSes.

## What the failed fixture taught
Observed in the failed fixture:
- Reading this PLY and writing a PLY with translate, scale and a linear-opacity filter worked; the count was exactly as predicted (opacity 0.9 kept, 0.2 dropped).
- `--stats json null` reads back count and per-column min/max of a file (used for read-back).
- The library keeps a source transform for PLY and converts on write (seen in `dist/cli.mjs`); this is consistent with the flip, but the convention was not confirmed from documentation.
- Unrecorded diagnostic, not evidence: compressed PLY and SOG (with `--gpu cpu`) from the same actions, written twice, were byte-identical and read back with the same count and bounds as the PLY. The CLI bundle has eight `Math.random` sites inside SOG k-means code; with only 60 splats that path may be trivial, so determinism at scale is unknown.

## Capability map
From the [official README](https://github.com/playcanvas/splat-transform) and `splat-transform --help`; documentation-only except the PLY path above.
- **Actions:** `-t` translate, `-r` rotate, `-s` scale, `-V` filter by value (`opacity,gt,0.5`), plus further filters listed in the README.
- **Formats:** read and write PLY, compressed PLY, SOG and others per the README; only PLY was written in the predeclared run.
- **Global flags:** `--gpu` (device for SOG), `--stats json`.
- **Library:** JavaScript API, untested.

## Install and doctor
Project-local, exact pin, no global install: in the example directory `pnpm add @playcanvas/splat-transform@3.12.0`; check with `node_modules/.bin/splat-transform --help`. Needs Node. `vcr doctor` does not probe candidates.

## Smoke test
```sh
vcr example create splat-transform-convert
cd examples/splat-transform-convert && ./run.sh --record && ./run.sh
# expect today: exit 1 at the PLY bounds check (the recorded failure)
```

## Recipe (documentation-only, untested in VCR beyond PLY translate, scale and filter)
```sh
splat-transform in.ply -t 10,-2,0.5 -s 2 -V opacity,gt,0.5 out.ply
splat-transform out.ply --stats json null   # read back count and bounds
```
Read the bounds back and compare against a single-axis test before building a pipeline on the sign of `-t`. Hash outputs per `FX-DETERMINISM` and `DELIVERY-CHECKSUM` only after a rerun check.

## Validated neighbours to use today
- gltf-transform and trimesh: mesh and glTF processing, not splats.
- playwright: capture a viewer render of a splat scene.
- No validated splat-to-splat converter exists in VCR yet.

## Troubleshooting
- Bounds off by a sign: the tool's frame differs from the PLY frame for x and y. Observed.
- SOG write fails or is slow without a GPU: try `--gpu cpu` (worked in the diagnostic; the fixture did not install any native `webgpu` module).

## Official docs
- [splat-transform](https://github.com/playcanvas/splat-transform) and its [releases](https://github.com/playcanvas/splat-transform/releases); the fixture ran 3.12.0 (the record's assessment saw 3.6.6).
- Licence: MIT per the PlayCanvas open-source listing; licence text not read.
