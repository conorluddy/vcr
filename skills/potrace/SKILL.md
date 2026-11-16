---
name: potrace
description: Trace a binary bitmap into smooth vector outlines with the Potrace CLI. Load after the source has been reduced to a one-bit image and a single-colour path is appropriate.
---

# Potrace

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this file; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Use Potrace for clean, single-colour paths from black-and-white bitmap input.
- Colour or grayscale input must be thresholded first; use ImageMagick or Potrace's documented preprocessing options. For colour tracing, use Inkscape.
- Evidence covers one generated 25×25 PBM ring, not varied artwork, tracing quality in general, or other output backends.

## Capability map
The CLI documents bitmap input, output backends (including SVG, PDF and EPS), page sizing, scaling and curve/turn policies. See the [official Potrace manual](https://potrace.sourceforge.net/potrace.1.html) and [project page](https://potrace.sourceforge.net/). VCR exercises PBM input, SVG output, tight bounds, one path with two contours and repeat-byte determinism. Other formats and tuning options are documented but untested here.

## Install and doctor
```sh
brew install potrace
potrace --version
# expect: potrace 1.16...
```
`vcr doctor` checks the `potrace` executable and reports its version; it does not install it.

## Smoke test
```sh
vcr example create potrace-pbm-svg
cd examples/potrace-pbm-svg && ./run.sh
# expect: output/trace.svg has one path with two contours; repeated SVG bytes match; expected metrics match.
```
Validated with Potrace 1.16 on macOS arm64. The fixture generates its PBM input and checks SVG structure, bounds and hash.

## Recipes
```sh
potrace --svg --tight --output output/trace.svg source.pbm
potrace --pdf --output output/trace.pdf source.pbm
```
Choose an output backend explicitly. `--tight` fits the SVG page to the traced object; don't infer general visual equivalence from the fixture's exact geometry checks.

## Troubleshooting
- Potrace rejects the input: convert it to a supported one-bit bitmap format such as PBM; threshold color or grayscale before tracing.
- The output has an unexpected page size: inspect `--tight`, scaling, and the source bitmap dimensions.

## Official docs
- [Potrace project and manual](https://potrace.sourceforge.net/)
- [Command-line manual](https://potrace.sourceforge.net/potrace.1.html)
