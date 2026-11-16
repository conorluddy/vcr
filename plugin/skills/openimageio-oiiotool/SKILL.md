---
name: openimageio-oiiotool
description: Process image files and sequences with the OpenImageIO command-line tool. Load for format-aware pixel, channel, metadata, or sequence operations; use ImageMagick for simpler still-image tasks.
---

# OpenImageIO / oiiotool

Inside the VCR repository, vcr is pnpm vcr. From an installed plugin, vcr is node <plugin-root>/cli/vcr.mjs.

## Use cases and limits
- oiiotool reads and writes supported image formats and applies ordered operations to an image stack. Use it when channel layout, bit depth, metadata, or float images matter.
- VCR validated OpenImageIO 3.2.2.0 on macOS arm64: --mulc 0.5 on a generated 2×2 uint8 RGB PPM, checking exact pixels, basic metadata, and byte-identical repeated output.
- No EXR, float/multichannel data, sequences, OCIO transforms, or other image formats were tested. Use ImageMagick for ordinary stills and OpenColorIO to author colour transforms.

## Capability map
- The [versioned oiiotool reference](https://openimageio.readthedocs.io/en/stable/oiiotool.html) documents ordered image-stack operations, input/output, image information, color operations, channel/subimage manipulation, and frame sequences.
- The fixture uses --version, PPM input, --mulc, -o, and --info -v only. Other commands and formats remain untested by VCR.
- OpenImageIO also provides library APIs and companion utilities such as maketx and iconvert; this guide maps the CLI path only.

## Install and doctor
    brew install openimageio
    oiiotool --version
    # expect: OpenImageIO 3.2.2.0

Homebrew may install or upgrade dependencies. Run vcr doctor to record machine availability; the example itself does not install software.

## Smoke test
    vcr example create oiiotool-ppm-mulc
    cd examples/oiiotool-ppm-mulc && ./run.sh
    # expect: OK: oiiotool pixels, metadata and repeat output match expected/result.json

The fixture verifies four RGB pixels, P6/2×2/3-channel/uint8 metadata and repeated output bytes. It tests channel multiplication only and makes no PPM orientation claim.

## Troubleshooting
- Version assertion fails: expected version is 3.2.2.0; inspect oiiotool --version before deciding whether to refresh evidence.
- Pixel assertions differ: inspect generated PPM and output metadata. The fixture repeats two distinct colors on both rows to avoid asserting ambiguous PPM orientation behavior.
- oiiotool is not found: install the Homebrew formula, then open a new shell or confirm its bin directory is on PATH.

## Official docs
- [OpenImageIO 3.2 documentation](https://openimageio.readthedocs.io/en/stable/)
- [oiiotool command reference](https://openimageio.readthedocs.io/en/stable/oiiotool.html)
