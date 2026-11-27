---
name: autotrace
description: Trace a bitmap to SVG with the AutoTrace CLI, as filled outlines or as centerline strokes. Load when line art must become single stroked paths; for one-bit outlines use potrace, for colour use vtracer.
---

# AutoTrace

`vcr` below means `node <plugin-root>/cli/vcr.mjs`; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Centerline mode (`-centerline`) turns stroke art into stroke-only SVG paths, ready for `vpype` or draw-on animation. This is what `potrace` and `vtracer` do not do.
- Outline mode gives filled black paths from greyscale input; use `potrace` for plain one-bit tracing.
- Evidence covers generated shapes and 8px strokes only, not scans, noise or colour.
- Copyleft (GPL-2.0-or-later, LGPL-2.1-or-later): do not bundle the binary casually.

## Capability map
Documented in `autotrace -help` and the [project](https://github.com/autotrace/autotrace): input via ImageMagick (many formats), output formats (svg, eps, pdf, dxf and more), colour reduction (`-color-count`), despeckle, corner and curve-fit thresholds, `-background-color`, `-preserve-width`. VCR exercises greyscale PNG in, SVG out, outline and `-centerline -preserve-width`. Other output formats, colour tracing and tuning options are untested.

## Install and doctor
```sh
brew install autotrace
autotrace --version   # expect: AutoTrace version 0.31.13
```
`vcr doctor` does not install it. Validated: 0.31.13, macOS arm64.

## Smoke test
```sh
vcr example create autotrace-centerline && (cd examples/autotrace-centerline && ./run.sh)
# expect: autotrace-centerline: OK  (outline IoU 0.9941, centerline IoU 0.9023)
```

## Recipes
```sh
autotrace -output-format svg -output-file out.svg in.png                              # filled outlines
autotrace -centerline -preserve-width -output-format svg -output-file out.svg in.png  # stroked centerlines
```
Output has no `viewBox`, only `width`/`height`, so resvg renders at input size. Rasterise with `resvg --background white` before comparing.

## Troubleshooting
- Centerline of solid blobs gives one fat stroke; use it on stroke art only.
- Crossing strokes become separate paths, with no shared junction.
- Round caps extend stroke ends, which cost the centerline IoU (0.90 against 0.99 for outlines).
- `autotrace --version` prints `0.31.13.` with a trailing dot; parse it.

## Official docs
- https://github.com/autotrace/autotrace
- https://autotrace.sourceforge.net/
