---
name: mediabunny
description: Use Mediabunny for TypeScript media inspection, decoding, conversion and writing in browser or Node workflows. The validated VCR fixture covers only PCM WAV metadata and sample decoding in Node.
---

# Mediabunny

`vcr` below means `node <plugin-root>/cli/vcr.mjs`; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits

- Use the base package for typed media I/O where browser support or a JavaScript API matters. Use FFmpeg for native filters, broad codec coverage and delivery encodes; use the server extension when Node needs its additional codecs.
- The fixture proves PCM WAV metadata reading and decoded sample extraction only. Compressed codecs, video, writing, conversion, browser behavior and other platforms are untested.

## Capability map

The [official guide](https://mediabunny.dev/guide/introduction) organizes the library around reading files, media sources/sinks, conversion, writing, and codec/format support. The fixture exercises `Input`, `BlobSource`, `AudioSampleSink` and PCM WAV decoding in Node. The other modules are documented but not validated by this VCR fixture.

## Install and doctor

```sh
npm ci --prefix examples/mediabunny-wav
vcr doctor
```

The fixture pins Mediabunny 1.62.1 locally and ran on macOS arm64 with Node 25.6.1. `vcr doctor` may not report project-local npm packages; verify the example-local install with `npm ls --prefix examples/mediabunny-wav mediabunny`.

## Smoke test

```sh
./examples/mediabunny-wav/run.sh
# expect: WAV metadata and 800 decoded mono samples match; stable decoded-sample SHA-256 is reported
```

The first eight float samples match the declared PCM input within 1e-6. The fixture's repeated decoded-data hash is `2b59354ab3065e00f0c6b820a44cfbc7ae266c7039228ebffd96298e6ec77fe2`.

## Troubleshooting

- `npm ci` cannot reach the registry: install only when network access is available; the fixture keeps dependencies under its own directory.
- No audio samples are returned: check the input track type and source format. The evidence covers generated PCM WAV, not compressed formats.

## Official docs

- [Introduction](https://mediabunny.dev/guide/introduction)
- [Reading media files](https://mediabunny.dev/guide/reading-media-files)
- [Media sinks](https://mediabunny.dev/guide/media-sinks)
- [Mediabunny 1.62.1 package](https://www.npmjs.com/package/mediabunny/v/1.62.1)
