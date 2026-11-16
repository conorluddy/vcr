---
name: frames-cli
description: Add a device-specific frame around an existing screenshot or recording. Load when a captured still or video needs the tool's device-aware sizing and bezel workflow.
---

# Frames CLI

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Frames CLI decorates media that already exists; it does not launch, capture or animate an app.
- The validated path frames one generated 1206×2622 still as a PNG using Frames CLI 1.7.0, Python 3.12.13, Pillow 12.0.0 and macOS 26.6 arm64. No video command, merge, other device, operating system or asset pack is validated.
- The asset pack is obtained separately and retains its own licence. The VCR example does not redistribute it. Check its terms for the specific use and do not infer rights for other uses or redistribution.
- For a generic image composite use ImageMagick; for video assembly use FFmpeg.

## Capability map
- The [upstream README](https://github.com/viticci/frames-cli/blob/main/README.md) documents CLI framing, automatic device matching, JSON output, batch processing and video workflows; [releases](https://github.com/viticci/frames-cli/releases) identify version-specific behavior.
- VCR tests one still-image CLI call with JSON metadata and repeat-byte comparison. Batch, merge, video, other CLI options and devices remain untested in VCR.

## Install and doctor
The example builds the 1.7.0 source release in its ignored output directory, creates a Python 3.12.13 virtual environment and installs its locked Pillow dependency. Follow the example README so the source version, asset pack and asset licence stay explicit. Do not use an arbitrary asset pack as a substitute.

Check an existing installation with:
```text
frames --version   # expect: frames v1.7.0
```
`vcr doctor` checks the configured command but does not install the separately licensed pack.

## Smoke test
```text
vcr example create frames-cli-ios-mockup
# obtain the separately licensed asset pack and follow the example README
cd examples/frames-cli-ios-mockup
./run.sh /path/to/asset-pack
# expect: JSON reports input_dimensions [1206,2622] and repeat_bytes_match true; recorded output was 1318×2717
```
Output dimensions depend on the matched frame; the recorded 1318×2717 is one sample. The two output files matched byte-for-byte on the tested setup.

## Troubleshooting
- If the command cannot find `NewFrames.json`, set `FRAMES_ASSETS` to the extracted asset-pack directory or pass that directory to `run.sh`.
- If the CLI is missing, build the pinned source release as described in the example README; it is not installed by `pip install Pillow` alone.
- If the source dimensions do not match the selected frame, check the input size and the CLI JSON device match before changing the expected output.

## Official docs
- [Frames CLI README](https://github.com/viticci/frames-cli/blob/main/README.md), [releases](https://github.com/viticci/frames-cli/releases), and [license](https://github.com/viticci/frames-cli/blob/main/LICENSE) (tested source release 1.7.0).
