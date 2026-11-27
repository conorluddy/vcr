# AutoTrace outline and centerline tracing

## Intent and scope

- Tool/version: AutoTrace 0.31.13 (Homebrew, macOS arm64); resvg only rasterises the result and is not the tool under test.
- Claim: a generated bitmap with known geometry traces to SVG, in outline mode (filled shapes) and in `-centerline -preserve-width` mode (stroke-only paths, about 8px wide); output is byte-identical on rerun; resvg rasterisation matches the input within a stated IoU.
- Adds over `potrace` and `vtracer`: centerline output, strokes instead of filled outlines.
- Excludes: scanned or noisy input, colour, other output formats, junction handling, other platforms.
- Input: `make_input.py` (Pillow): 200x200 greyscale, a disc, rectangle and triangle; and a ring, a cross and a diagonal drawn with 8px strokes.
- Install: `brew install autotrace resvg` (both already present).

## Plan, before running

- Commands: `autotrace -output-format svg` on the solid image; `autotrace -centerline -preserve-width -output-format svg` on the strokes image, twice.
- Predeclared checks, never loosened: outline IoU >= 0.97; centerline IoU >= 0.90 (ink < 128, resvg on white); centerline paths all `fill:none`; stroke widths within 7 to 9; outline has black fills; repeat SVG bytes equal.
- Stop if autotrace is not 0.31.13 or a check fails unexpectedly. A failed check is recorded as `KNOWN FAIL`.

## Observation, after running

- 2026-11-27, `Conors-MacBook-Pro-2.local`: all checks passed. Outline IoU 0.9941; centerline IoU 0.9023 (close to its floor: round caps extend each end by half a stroke width); stroke widths 8.79, 8.35, 8.70, 7.89.
- Inspected a montage of inputs and traces at 200px: shapes and strokes match. Observed limit: the vertical and horizontal bars of the cross are two separate paths, with no shared junction.
- A centerline run on solid blobs gives fat strokes, so use it on stroke art only.
- Does not establish: quality on real scans, other versions or OSes.
