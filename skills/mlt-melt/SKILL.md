---
name: mlt-melt
description: Render MLT producer/consumer jobs with the `melt` CLI or inspect its timeline model. Load when an MLT service or project is needed; use FFmpeg for simple encode, trim or concat jobs.
---

# MLT / melt

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`. Run it from the workspace (the directory holding `vcr.json`).

## Use cases and limits
- `melt` connects producers, filters, transitions and consumers, and can render XML projects headlessly.
- VCR evidence covers only MLT 7.42.0 on macOS arm64: built-in `colour:red` producer to `avformat` FFV1 output, five frames at 64×48 and 25 fps, with repeated decoded pixels matching.
- XML timelines, filters, transitions, audio, alpha, other consumers and other platforms remain untested. Use `ffmpeg-ffprobe` for simple single-operation media jobs.

## Capability map
The [melt CLI guide](https://mltframework.org/docs/melt/) describes command-line producer/consumer composition and XML project playback. The [service and plugin references](https://mltframework.org/docs/) cover producers, filters, transitions and consumers; the [avformat consumer properties](https://github.com/mltframework/mlt/blob/v7.42.0/src/modules/avformat/consumer_avformat.yml) list output controls. VCR exercises the colour producer, `out`, the avformat consumer, FFV1 codec selection and frame-size/rate properties only; the wider service graph and XML model are documented but untested.

## Install and doctor
```text
brew install mlt
melt -version
vcr doctor
```
The validated Homebrew build was MLT 7.42.0_1 (`melt -version` reports 7.42.0), with FFmpeg/ffprobe 9.0.2 on macOS 26.6 arm64.

## Smoke test
```text
vcr example create mlt-color-render
cd examples/mlt-color-render && ./run.sh
# expect: MLT render metadata and decoded pixels match expected/render.json
```
The expected result is five FFV1 frames at 64×48 and 25 fps, 0.2 s; center RGB `[254,0,0]`, with identical decoded RGB hashes across the two renders.

## Recipes
```text
melt colour:red out=4 -consumer avformat:output/red.mkv vcodec=ffv1 acodec=none s=64x48 r=25
```
`out=4` is the inclusive final frame here, yielding five frames. The example sets output size and frame rate on the consumer; it is a fixture recipe, not a general project template.

## Troubleshooting
- No output file or unexpected stream: inspect `output/melt-1.log` and verify the selected build has the avformat consumer and FFV1 support.
- Frame count differs: check MLT's inclusive `in`/`out` frame range and the consumer frame rate before changing expected output.
- Repeat hashes differ: stop and inspect the two decoded outputs; do not update `expected/` until the difference is understood.

## Official docs
- [MLT 7.42.0 release notes](https://www.mltframework.org/blog/v7.42.0_released/)
- [melt command-line documentation](https://mltframework.org/docs/melt/)
- [avformat consumer properties at v7.42.0](https://github.com/mltframework/mlt/blob/v7.42.0/src/modules/avformat/consumer_avformat.yml)
