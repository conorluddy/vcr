---
name: hyperframes
description: Use HyperFrames to render an HTML composition through its own CLI when a standalone browser-video renderer is useful. The VCR fixture covers only a static local PNG sequence; it does not validate animation or encoded video output.
---

# HyperFrames

`vcr` below means `node <plugin-root>/cli/vcr.mjs`; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits

- Use as a standalone HTML-to-frame renderer or as a reference for browser capture workflows. It is not a VCR dependency or shared timeline.
- The validated route renders a static HTML composition to PNGs. For VCR-owned browser capture use `vcr capture`; use FFmpeg for encoding and muxing.
- Animation, timeline seeking, registry blocks, audio, MP4 encoding, hosted rendering and other browsers remain untested by this fixture.

## Capability map

The official CLI surface includes `init`, `preview`, and `render`; see the [CLI package source](https://github.com/heygen-com/hyperframes/tree/main/packages/cli), [rendering overview](https://hyperframes.heygen.com/tools/html-to-video), and [deployment guide](https://hyperframes.heygen.com/guides/deploy). The fixture exercises only local `render` with `data-no-timeline`, producing a repeatable PNG sequence. Project authoring, timelines, tracks, sub-compositions, audio, containers and hosted routes are documented surfaces but untested here.

## Install and doctor

The fixture installs exact dependencies locally:

```sh
npm ci --prefix examples/hyperframes-static-square
npx hyperframes --version
vcr doctor
```

The fixture used HyperFrames 0.9.33 with Node 25.6.1, Google Chrome 157.0.8103.51 and FFmpeg 9.0.2 on macOS arm64. `vcr doctor` reports local tool availability; this guide does not claim it is installed.

## Smoke test

```sh
./examples/hyperframes-static-square/run.sh
# expect: OK: HyperFrames frame count, geometry, timing and repeat metrics match expected/result.json
```

## Troubleshooting

- The fixture cannot find its browser: install dependencies, then ensure Chrome is available at the path selected by the fixture or configure `HYPERFRAMES_BROWSER_PATH`.
- Expected output differs: inspect the recorded HyperFrames, browser and FFmpeg versions before re-recording; the fixture asserts dimensions, geometry and repeatability, not animation quality.

## Official docs

- [HyperFrames CLI](https://hyperframes.heygen.com/docs/cli)
- [Rendering](https://hyperframes.heygen.com/docs/rendering)
- [Source repository](https://github.com/heygen-com/hyperframes)
