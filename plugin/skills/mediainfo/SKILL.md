---
name: mediainfo
description: Inspect container, stream and tag metadata from audio or video files with MediaInfo. Load when a second metadata report or structured JSON inspection is useful; use FFmpeg for decoding or transcoding.
---

# MediaInfo

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`. Run it from the workspace (the directory holding `vcr.json`).

## Use cases and limits
- Use the CLI to inspect reported container and track properties; JSON output is convenient for scripts. Compare with ffprobe when a second inspector is useful.
- The fixture validates only generated PCM WAV metadata on macOS arm64 with MediaInfo CLI 26.10. It does not establish compressed formats, tags, malformed-file behavior, or agreement with other tools.
- MediaInfo describes files; use `ffmpeg-ffprobe` to decode, encode, assemble or probe stream behavior.

## Capability map
The [MediaInfo CLI and library](https://mediaarea.net/en/MediaInfo) expose text and structured reports; the [field reference](https://mediaarea.net/en/MediaInfo/Support/Fields) maps General, Video, Audio and other track fields. VCR exercises `--Output=JSON` for a single WAV and checks container, codec, rate, channels, bit depth, duration and byte size. Other formats, fields, output templates, library bindings and tag interpretation remain documented but untested here.

## Install and doctor
Install the MediaInfo CLI from the [official downloads](https://mediaarea.net/en/MediaInfo/Download). On the validated macOS host the Homebrew formula was `media-info`:

```text
brew install media-info
mediainfo --Version
vcr doctor
```

Validated CLI version: 26.10 on macOS 26.6 arm64. Build-specific components and dependency terms vary; check the selected package.

## Smoke test
```text
vcr example create mediainfo-wav
cd examples/mediainfo-wav && ./run.sh
# expect: MediaInfo JSON reports Wave, PCM, 8000 Hz, 1 channel, 16-bit, 1.0 s; generated file is 16044 bytes
```

The fixture generates a one-second silent mono PCM WAV and retains only its checked summary; raw media and reports stay in ignored `output/`.

## Troubleshooting
- JSON assertion differs: inspect `output/mediainfo.json` and confirm the CLI version with `mediainfo --Version`; do not treat a changed report as equivalent without checking its fields.
- `mediainfo` is not found: install the CLI package for the current platform, then rerun `vcr doctor`.

## Official docs
- [MediaInfo 26.10 release](https://github.com/MediaArea/MediaInfo/releases/tag/v26.10)
- [MediaInfo field reference](https://mediaarea.net/en/MediaInfo/Support/Fields)
- [MediaInfo downloads](https://mediaarea.net/en/MediaInfo/Download)
