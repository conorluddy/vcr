---
name: ffmpeg-wasm
description: Run an FFmpeg command in a browser worker when browser-only processing needs filters or codecs unavailable through WebCodecs. Load for the 0.12 ESM API; use native FFmpeg for local or CI delivery.
---

# FFmpeg.wasm

`vcr` below means `node <plugin-root>/cli/vcr.mjs`; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- FFmpeg.wasm runs a selected FFmpeg core in a browser worker with an in-memory filesystem. Use it for a browser feature that specifically needs an FFmpeg filter or codec.
- Native `ffmpeg-ffprobe` is faster for workstation and CI work; Mediabunny is a smaller browser option for common media operations. VCR validated only a single-thread PCM WAV sample trim with `@ffmpeg/ffmpeg` 0.12.15, `@ffmpeg/core` 0.12.10 and FFmpeg 5.1.4. No video, other codecs, multi-thread mode, large inputs or performance were tested.
- The wrapper is MIT; core builds have their own LGPL/GPL terms. The validated core reports GPL-2.0-or-later. Check the exact core and enabled libraries before redistributing it.

## Capability map
- **Worker lifecycle and virtual files:** the [0.12 usage guide](https://ffmpegwasm.netlify.app/docs/getting-started/usage/) covers `load`, `writeFile`, `exec`, `readFile` and `terminate`. VCR tests load, write, execute and read a WAV, then terminate the worker.
- **Core selection and threading:** [installation and core docs](https://ffmpegwasm.netlify.app/docs/getting-started/installation/) cover single-thread and multi-thread cores and deployment. Only the single-thread core is tested; multi-thread deployment requires cross-origin isolation and is untested here.
- **FFmpeg commands:** the browser CLI accepts FFmpeg arguments; see [FFmpeg filter documentation](https://ffmpeg.org/ffmpeg-filters.html). VCR tests only `atrim` by exact sample indexes and PCM s16le output. Other filters and formats are not validated.

## Install and doctor
```sh
pnpm add @ffmpeg/ffmpeg@0.12.15 @ffmpeg/core@0.12.10
```
`vcr doctor` has no machine probe for this project-local browser library. Resolve both packages from the app and check with `pnpm list @ffmpeg/ffmpeg @ffmpeg/core --depth 0`. Serve the core assets from the app; do not assume a CDN path or worker URL works with every bundler.

## Smoke test
```sh
vcr example create ffmpeg-wasm-pcm-trim
cd examples/ffmpeg-wasm-pcm-trim && npm ci && ./run.sh
# expect: OK: FFmpeg.wasm WAV trim sample count, exact data and repeat metrics match expected/result.json
```
This creates an 8 kHz mono PCM WAV in memory, keeps samples 2000–5999, then checks all 4,000 output samples and a repeated run. The measured core is GPL-2.0-or-later.

## Troubleshooting
- If the worker fails to load, verify that the wrapper, core JS and WASM assets are served from reachable URLs with the expected MIME types; use the example's Vite configuration as the tested route.
- If `exec` returns nonzero or times out, inspect the captured FFmpeg logs and test the command with the same FFmpeg build before changing the fixture.
- Multi-thread core startup can fail without cross-origin isolation (`COOP`/`COEP`) and `SharedArrayBuffer`; this fixture is single-threaded and does not provide that route.

## Official docs
- [Installation](https://ffmpegwasm.netlify.app/docs/getting-started/installation/), [usage](https://ffmpegwasm.netlify.app/docs/getting-started/usage/), and [API](https://ffmpegwasm.netlify.app/docs/api/ffmpeg/); fixture checked 2026-11-16.
