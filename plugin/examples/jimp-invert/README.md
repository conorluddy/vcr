# Jimp invert

## Plan, before running

- Claim: Jimp 1.6.1 inverts RGB channels of a generated 2×1 RGBA image while preserving alpha and dimensions, and writes a PNG that can be reopened.
- Exclusions: resize, compositing, JPEG or other formats, color profiles, performance, other platforms, and large images.
- Input: generated in code from two explicit RGBA pixels; no external assets or licensing dependencies.
- Command: `./run.sh` using Node and Jimp 1.6.1 from this example's pinned dependency.
- Checks: dimensions remain 2×1; expected pixels are (245,235,225,255) and (55,155,205,128); reopening succeeds; PNG hash matches the recorded run.
- Stop conditions: mismatched pixel, alpha, dimensions, decode failure, or output hash mismatch.
- Inspect: use `magick output/inverted.png -scale 800% output/preview.png` and inspect the enlarged two-pixel output.

## Observation, after running

- 2026-11-15, Conors-MacBook-Pro-2.local, macOS 26.6 arm64, Node 25.6.1. Jimp reports 1.6.1. `./run.sh --record` followed by `./run.sh` passed.
- Reopened PNG is 2×1. Pixel values are (245,235,225,255) and (55,155,205,128); both alpha values are preserved. PNG SHA-256: `35161837d908fdef5735828db3656c365f54d8035a9987b1fe70e0d8e0001a43`.
- Inspected an 8× nearest-neighbour enlargement: the opaque pale pixel and translucent blue pixel are distinct, with no unexpected colors. No correction was needed.
- This proves one generated RGBA invert and PNG reopen on this Jimp/Node/macOS combination. It does not test other operations, formats, large images, performance or other hosts.
