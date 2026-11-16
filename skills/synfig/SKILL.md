---
name: synfig
description: Render an existing Synfig `.sif` project with the headless CLI. Load when a static PNG render is needed; current VCR evidence covers one frame and PNG only.
---

# Synfig CLI

`vcr` means `pnpm vcr` inside the repository or `node <plugin-root>/cli/vcr.mjs` from the installed plugin.

## Use cases and limits
- Render a Synfig project headlessly when its authored scene is already available.
- VCR evidence covers one static `.sif` rectangle at time zero on macOS arm64. It does not establish animation, Studio authoring, video output, other layers, or other platforms.
- For code-authored vector scenes, use SVG or Anime.js; for 3D, use Blender.

## Capability map
The [CLI syntax](https://wiki.synfig.org/Doc%3ASynfig_CLI_Syntax) and [render options](https://wiki.synfig.org/Render_options) document project input, target, size, frame/time selection, and output controls. The [SIF format reference](https://wiki.synfig.org/Sif_Format) describes project files. VCR exercises only `--target=png`, input/output paths, 160×120 size, and `--time=0s`; all other targets, ranges, layers and options are documented but untested here.

## Install and doctor
```sh
brew install synfig
synfig --version
# expect: synfig 1.5.5
```
`vcr doctor` checks the configured executable; it does not install Synfig. Validation used Homebrew formula 1.5.5_4 on macOS 26.6 arm64.

## Smoke test
```sh
vcr example create synfig-static-render
cd examples/synfig-static-render && ./run.sh
# expect: JSON reports 160x120, center [255,0,0,255], transparent corner [0,0,0,0], repeat_sha256_equal true
```

## Troubleshooting
- Synfig may log that optional `mod_jpeg` is unavailable. This did not prevent the PNG target in the validated run; treat failures from other targets as untested.
- A version mismatch fails the fixture intentionally; use the recorded 1.5.5 CLI before comparing expected output.

## Official docs
- [Synfig CLI syntax](https://wiki.synfig.org/Doc%3ASynfig_CLI_Syntax)
- [Render options](https://wiki.synfig.org/Render_options)
- [SIF format](https://wiki.synfig.org/Sif_Format)
