---
name: node-av
description: Load when a Node process should decode or encode video in-process through node-av's FFmpeg bindings instead of shelling out. VCR evidence covers only H.264 MP4 decode and libx264 re-encode on macOS arm64 with Node 22.
---

# node-av

`vcr` below means `node <plugin-root>/cli/vcr.mjs`; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits

- Decode a video frame by frame and re-encode it from a Node script, with no child process. Prefer the `ffmpeg` CLI for delivery, filtergraphs, muxing recipes and anything a one-line command does; reach for node-av only when frames must pass through your own Node code.
- Evidence covers one 24-frame 320x240 H.264 yuv420p MP4: frame-by-frame decode, libx264 re-encode, matching ffprobe fields. Not covered: pixel quality, audio, other codecs, filters, hardware acceleration, other platforms or Node versions.
- node-av bundles its own FFmpeg (8.1.3 in the fixture), separate from any system `ffmpeg` (9.0.2 on the test host). Their codecs, flags and licensing can differ; check the bundled build before redistributing.
- Re-encoded bytes are not claimed stable across machines or builds; verify with ffprobe fields and decoded facts.

## Capability map

Discovery only; see the [README](https://github.com/seydx/node-av) and [releases](https://github.com/seydx/node-av/releases) for the reference.

| Area | Import | Status here |
| --- | --- | --- |
| High-level `Demuxer`, `Decoder`, `Encoder`, `Muxer` | `node-av/api` | Tested (below) |
| Constants such as `AV_PIX_FMT_YUV420P`, `FF_ENCODER_LIBX264` | `node-av/constants` | Tested |
| `ffmpegVersion()` for the bundled build | `node-av/ffmpeg` | Tested |
| Filters, audio, other codecs, hardware acceleration, low-level bindings | various | Documented, untested |

## Install and doctor

```sh
pnpm install   # workspace root; node-av@7.1.0 is pinned in examples/node-av-decode-encode
vcr doctor
```

`vcr doctor` does not report project-local npm packages; check with `node -e "require('node-av')"` from the example directory. node-av ships a prebuilt platform package (`@seydx/node-av-darwin-arm64` here). pnpm reported node-av's install script as ignored, yet the binary loaded and the fixture passed.

## Smoke test

```sh
examples/node-av-decode-encode/run.sh
# expect: node-av-decode-encode: OK
```

It needs system `ffmpeg` and `ffprobe` only to generate the input and probe. Facts are compared with `expected/metrics.json`; versions are printed, not compared.

## Tested recipes

Decode frame by frame (`frame.format` compared to `AV_PIX_FMT_YUV420P`; `pts` is a bigint):

```ts
await using input = await Demuxer.open(path);
const video = input.video();
using decoder = await Decoder.create(video);
for await (const frame of decoder.frames(input.packets(video.index))) {
  if (frame === null) continue;   // end-of-stream flush
  // frame.width, frame.height, frame.pts, frame.toBuffer()
  frame.free();
}
```

Re-encode with libx264:

```ts
using encoder = await Encoder.create(FF_ENCODER_LIBX264, { decoder });
await using output = await Muxer.open(outFile, { input });
const index = output.addStream(encoder, { inputStream: video });
for await (using packet of encoder.packets(decoder.frames(input.packets(video.index)))) {
  if (packet === null) continue;
  await output.writePacket(packet, index);
}
```

Observed on the fixture: 24 frames, 320x240, yuv420p, strictly increasing pts, 24 distinct frame hashes; the output probes as h264 320x240 yuv420p, 24 frames, `24/1`, and decodes back with the same facts. Run on macOS arm64, Node v22.19.0, node-av 7.1.0.

## Troubleshooting

- libx264 prints encoder statistics to stderr; they are not errors (captured in `output/run.log`).
- Import fails: the platform package did not install; node-av needs its optional `@seydx/node-av-<platform>` package.
- Encoder creation fails: the bundled FFmpeg may lack the encoder; call `ffmpegVersion()` and compare with the build you expect.
- Frame or output mismatch: do not loosen the expected values; inspect decoded facts and ffprobe output first.

## Official docs

- [node-av repository and README](https://github.com/seydx/node-av)
- [Releases](https://github.com/seydx/node-av/releases)
- [Licence](https://github.com/seydx/node-av/blob/main/LICENSE.md)
