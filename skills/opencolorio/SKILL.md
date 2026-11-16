---
name: opencolorio
description: Apply config-driven colour transforms to pixels with OpenColorIO. Load when transformations must be explicit and repeatable; use OpenImageIO or ImageMagick when you need file operations.
---

# OpenColorIO

Inside the VCR repository, vcr is pnpm vcr. From an installed plugin, vcr is node <plugin-root>/cli/vcr.mjs.

## Use cases and limits
- OpenColorIO (OCIO) applies colour transforms from a config or explicit transform. It processes pixel values; it is not an image reader, writer, or compositor.
- VCR evidence covers OCIO 2.6.0's Python API applying one explicit MatrixTransform to four float RGB pixels through a CPU processor on macOS arm64 / CPython 3.14.8.
- ACES, production configs, display transforms, external configs, files, GPU processing, and production-pipeline colour correctness are untested. Use OpenImageIO or ImageMagick for image files.

## Capability map
- The [Config API](https://opencolorio.readthedocs.io/en/v2.6.0/api/config.html) describes colour spaces, displays/views, and processor configuration.
- The [Transform API](https://opencolorio.readthedocs.io/en/v2.6.0/api/transforms.html) documents MatrixTransform and other transform nodes.
- The [Processor API](https://opencolorio.readthedocs.io/en/v2.6.0/api/processors.html) covers CPU/GPU processors and pixel application. The fixture exercises Config.CreateRaw(), MatrixTransform, getProcessor(), and CPUProcessor.applyRGB() only.
- OCIO also ships utilities such as ociocheck and ocioconvert; broader file workflows are documented but not validated here.

## Install and doctor
The VCR fixture creates a local Python environment and installs the pinned wheel; it needs python3.14 and a compatible CPython 3.14 wheel.

    ./examples/opencolorio-matrix/run.sh
    # expect: opencolorio-matrix: OK

For a machine-wide CLI install, the record lists brew install opencolorio; check with ociocheck --help. Then run vcr doctor to record machine availability. Neither route claims OCIO is installed.

## Smoke test
    vcr example create opencolorio-matrix
    cd examples/opencolorio-matrix && ./run.sh
    # expect: opencolorio-matrix: OK

The fixture checks four declared RGB outputs within 1e-6 and exact equality across independent runs; the float32 hash is expected to match on the validated environment.

## Troubleshooting
- The fixture cannot create .venv: install Python 3.14 and verify requirements.txt has a compatible wheel; it intentionally refuses a source build.
- ociocheck -h fails: this build accepts ociocheck --help.
- Pixel results differ: confirm the OCIO version, matrix, offset, and CPU path before changing expected output. Do not replace the OCIO processor with handwritten math.

## Official docs
- [OpenColorIO v2.6.0 Config](https://opencolorio.readthedocs.io/en/v2.6.0/api/config.html), [Transforms](https://opencolorio.readthedocs.io/en/v2.6.0/api/transforms.html), [Processors](https://opencolorio.readthedocs.io/en/v2.6.0/api/processors.html)
- [PyPI package 2.6.0](https://pypi.org/project/opencolorio/2.6.0/)
