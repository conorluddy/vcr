---
name: mediabunny-server-extension
description: Load when a Node pipeline uses Mediabunny's optional server extension to register NodeAV-backed codecs. VCR evidence covers only AAC decode and forced AAC transcode on one macOS arm64 setup.
---

# Mediabunny server extension

`vcr` below means `node <plugin-root>/cli/vcr.mjs`; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits

- Add the separate `@mediabunny/server` package when Node needs codecs or transforms not available through browser WebCodecs. Use FFmpeg CLI for filtergraphs, muxing control and simple delivery scripts.
- Evidence covers AAC decode and forced AAC re-encode/decode through NodeAV on macOS arm64. Video, other codecs, hardware acceleration, Windows/Linux, Bun and Deno remain untested.
- Package licensing and bundled codec terms are separate concerns; inspect the installed package notices and FFmpeg build terms for the intended distribution.

## Capability map

The [server extension guide](https://mediabunny.dev/guide/extensions/server) documents runtime registration and NodeAV-backed codec support. The fixture exercises `registerMediabunnyServer()`, AAC `canDecode()`, `AudioSampleSink` decode and forced AAC conversion. Other codecs, transforms, hardware paths and non-Node runtimes are documented but untested here.

## Install and doctor

```sh
npm ci --prefix examples/mediabunny-server-aac
vcr doctor
```

The fixture pins `mediabunny` and `@mediabunny/server` 1.66.0 and ran on macOS arm64 with Node 25.6.1, NodeAV 6.2.0 and FFmpeg 8.1. It also uses the system FFmpeg 9.0.2 to generate its AAC input. `vcr doctor` may not report project-local npm packages; verify them with `npm ls --prefix examples/mediabunny-server-aac mediabunny @mediabunny/server`.

## Smoke test

```sh
./examples/mediabunny-server-aac/run.sh
# expect: canDecode false before registration, true after; AAC output tone metrics match expected/metrics.json
```

The test compares semantic metrics, not compressed-file hashes. Decoded samples span about 1.024 s while track metadata is about 1.0 s; exact trimming is not established.

## Troubleshooting

- AAC remains unavailable: call `registerMediabunnyServer()` before creating inputs or conversions, then check the installed NodeAV platform package.
- Native dependency installation fails: this route depends on a platform-specific NodeAV package; the fixture only validates macOS arm64.
- Source/output metrics drift: inspect codec/runtime versions and the generated source WAV; do not infer production audio quality from the tone measurements.

## Official docs

- [Server extension](https://mediabunny.dev/guide/extensions/server)
- [Converting media](https://mediabunny.dev/guide/converting-media-files)
- [Media sinks](https://mediabunny.dev/guide/media-sinks)
- [Reading media files](https://mediabunny.dev/guide/reading-media-files)
