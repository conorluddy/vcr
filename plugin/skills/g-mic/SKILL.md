---
name: g-mic
description: Apply G'MIC command-line filters and procedural image operations to stills or image sequences. Load when an image needs a filter or generative treatment outside ordinary conversion and compositing.
---

# G'MIC

`vcr` below means `node <plugin-root>/cli/vcr.mjs`; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- VCR evidence covers G'MIC 4.0.7 on macOS arm64 applying `-negate` to one 2×2, 8-bit grayscale PGM. Exact pixels and repeat output bytes are checked.
- The fixture says nothing about other filters, color images, bit depths, sequence processing, quality or other builds. Use ImageMagick for ordinary conversion/crop/resize, OpenColorIO or OpenImageIO for color-managed work, and a separate compositing tool for layer assembly.
- Pin the G'MIC version and preserve input/output metadata when a pipeline depends on reproducibility.

## Capability map
- The official [command reference](https://gmic.eu/reference/list_of_commands.html) groups operations across input/output, list manipulation, geometry, colors, filtering, drawing, 3D, flow control and sequence processing.
- The [command-items reference](https://gmic.eu/reference/command_items_and_selections.html) explains argument order and image selections. The [custom commands guide](https://gmic.eu/reference/adding_custom_commands.html) documents user-defined commands.
- VCR tests only `-negate` on an 8-bit grayscale PGM and exact repeatability. The remaining documented commands and image formats are untested in VCR.

## Install and doctor
```text
brew install gmic
gmic version
# expect: 4.0.7
```
Then run `vcr doctor` to record tool availability. A doctor result is machine-specific; this guide does not claim G'MIC is installed.

## Smoke test
```text
./examples/g-mic-negate/run.sh
# expect: g-mic-negate: OK
```
The fixture verifies samples `[255, 191, 127, 0]` and byte-identical repeated PGM output against `expected/metrics.json`.

## Recipes
```text
gmic input.pgm -negate -o output.pgm
gmic input.png -resize 50% -o output-small.png
```
Only the first operation has VCR evidence. Consult the command reference before composing other operations; G'MIC processes command items in order.

## Troubleshooting
- G'MIC interprets an input unexpectedly: verify the file format and bit depth; the tested fixture uses binary P5 PGM because this build had a text-PGM parsing issue.
- The fixture reports changed pixels or hash: confirm `gmic version` is 4.0.7 and inspect the source image before recording a new baseline.
- A user configuration warning appears: the fixture observed an unwritable default config directory while the operation still completed; check command exit status and output assertions rather than suppressing the warning blindly.

## Official docs
- [G'MIC reference and command list](https://gmic.eu/reference/list_of_commands.html)
- [Command items and selections](https://gmic.eu/reference/command_items_and_selections.html)
- [Adding custom commands](https://gmic.eu/reference/adding_custom_commands.html)
