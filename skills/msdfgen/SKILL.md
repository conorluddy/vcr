---
name: msdfgen
description: Generate signed-distance-field images from vector shapes or font glyphs with the msdfgen CLI. Load when a shader-ready distance field is needed; atlas generation is a separate tool.
---

# msdfgen

VCR evidence covers msdfgen 1.13.1 on macOS 26.6 arm64: one SVG path converted to a 64×64 MSDF and a 256×256 test render. Font loading, atlases, shader sampling quality, and other builds remain untested.

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Use MSDF output as a compact texture representation when a renderer will sample it for crisp edges.
- The fixture reads the last vector path in its SVG. It does not validate font input, atlas generation, arbitrary SVG elements, or downstream shader quality.
- `msdf-atlas-gen` is a separate project for font atlases; ordinary vector rasterisation can use resvg.

## Capability map
- Distance-field modes include `sdf`, `psdf`, `msdf`, and `mtsdf`; the fixture exercises `msdf` only.
- Inputs include SVG, font glyphs, and text shape descriptions; the fixture exercises one SVG path. Font input depends on build extensions and remains untested ([official CLI reference](https://github.com/Chlumsky/msdfgen#console-commands)).
- Output controls include dimensions, range, framing, output format, metrics, and test rendering. The fixture exercises PNG output, dimensions, pixel range, automatic framing, and `-testrender`; other options remain untested ([project README](https://github.com/Chlumsky/msdfgen)).

## Install and doctor
```sh
brew install msdfgen
msdfgen -help
```
The guide does not claim it is installed. The recorded run used Homebrew msdfgen 1.13.1; check the local version with `msdfgen -version` if available, or inspect the version shown by the package manager.

## Smoke test
```sh
./examples/msdfgen-svg/run.sh
# expect: OK: msdfgen-svg
```
The fixture compares the distance-field dimensions, channels, and hash with `expected/metrics.json`; it also creates a test-render image under ignored `output/`.

## Troubleshooting
- If SVG import fails, confirm the input has a supported vector path; the fixture intentionally uses one closed path.
- If a requested font cannot be loaded, verify the build includes the font-input extension and its FreeType support; this path has not been validated by VCR.
- A changed field hash can indicate a version or build change; do not replace expected output without inspecting the generated field and test render.

## Official docs
- [msdfgen README and CLI](https://github.com/Chlumsky/msdfgen)
- [Changelog](https://github.com/Chlumsky/msdfgen/blob/master/CHANGELOG.md)
- [Releases](https://github.com/Chlumsky/msdfgen/releases)
