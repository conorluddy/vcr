---
name: rawtherapee-cli
description: Batch-process supported image inputs with RawTherapee's command-line interface. Load when a profile-driven local image conversion is needed; the VCR fixture tests only a generated PNG export, not camera RAW development.
---

# RawTherapee CLI

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`. Run it from the workspace (the directory holding `vcr.json`).

## Use cases and limits

- Use `rawtherapee-cli` for noninteractive batch processing with a `.pp3` processing profile. The supported option surface is broader than VCR's fixture.
- Evidence covers RawTherapee CLI 5.13 on macOS 26.6 arm64 exporting one generated 64×48 RGB PNG to 8-bit compressed PNG. Two runs matched byte-for-byte.
- RAW decoding, PP3 behavior, camera profiles, color accuracy, other output formats and other platforms are untested here. Do not infer image quality from the repeatability check.
- Use ImageMagick or Sharp for ordinary raster operations that do not need RawTherapee's processing pipeline.

## Capability map

- [Command-line options](https://rawpedia.pixls.us/command-line_options/): input selection, output, profiles and batch flags. VCR tests `-q -n -b8 -o <dir> -Y -c <file>` on a PNG; it does not exercise profile processing.
- [RawTherapee 5.13 release/download page](https://www.rawtherapee.com/downloads/5.13/): version-specific installation and release information.
- The GUI's full RAW processing and profile controls are documented but outside this CLI fixture's tested scope.

## Install and doctor

On macOS, install the app and expose `rawtherapee-cli` on `PATH`:

```sh
brew install --cask rawtherapee
rawtherapee-cli -v 2>&1 | head -1
magick -version
vcr doctor
```

The fixture also needs ImageMagick's `magick identify` for output inspection. It reads the version line even though this build's `-v` probe exits with status 255; that behavior is handled by the fixture.

## Smoke test

```sh
vcr example create rawtherapee-cli-png-export
cd examples/rawtherapee-cli-png-export && ./run.sh
# expect: JSON reports 64x48 PNG, 2434 distinct colors, repeat_bytes_match=true
```

The exact output SHA-256 is `579020089175ba9a0bf88e33ac49fa636c63d21656b862282e3297c7f2a3fb56` on the validated host. Output, logs and transient cache stay in ignored `output/`.

## Troubleshooting

- Version check differs: the fixture requires the exact `RawTherapee, version 5.13, command line.` line; inspect both stdout and stderr from `rawtherapee-cli -v`.
- Conversion fails or produces no file: check the CLI log under `output/`; keep `-c` last because RawTherapee requires it as the final option.
- ImageMagick check fails: install its CLI separately and confirm `magick identify` resolves.

## Official docs

- [RawPedia command-line options](https://rawpedia.pixls.us/command-line_options/)
- [RawTherapee 5.13 downloads and release notes](https://www.rawtherapee.com/downloads/5.13/)
- [RawTherapee source licence](https://github.com/RawTherapee/RawTherapee/blob/dev/LICENSE.txt)
