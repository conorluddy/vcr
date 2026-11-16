---
name: jimp
description: Process small images in Node with Jimp when a pure-JavaScript dependency is useful. Use after choosing Jimp for a project-local image operation.
---

# Jimp

`vcr` below means `pnpm vcr` inside this repository, or `node <plugin-root>/cli/vcr.mjs` from an installed plugin; run commands from the workspace.

Evidence: Jimp 1.6.1 on Node 25.6.1, macOS 26.6 arm64. The fixture creates a 2×1 RGBA bitmap, inverts RGB, writes PNG and reopens it. Performance, large images, other formats and other operations are untested.

## Use cases and limits
- Use for a small project-local image transform without native binaries. For larger workloads or broad format support, compare Sharp or ImageMagick; this fixture measured neither speed nor format breadth.
- Only invert and PNG round-trip are validated here. Treat all other operations as documented APIs, not validated VCR behavior.

## Capability map
- Core bitmap operations: create/read images, inspect or set pixels, and write buffers/files ([Jimp API](https://jimp-dev.github.io/jimp/api/jimp/classes/jimp/)).
- Plugins add operation families such as color, resize, crop, composite and quantize; use the official [API reference](https://jimp-dev.github.io/jimp/api/) to find their current entry points.
- The fixture exercises `new Jimp`, `setPixelColor`, `invert`, `write`, `Jimp.read`, `getPixelColor`, and PNG encoding. Other operations and formats are untested.

## Install and doctor
```sh
pnpm add jimp@1.6.1
vcr tools info jimp
```
Jimp is a project dependency rather than a machine binary, so `vcr doctor` does not probe it. Check the version in the project with `pnpm list jimp --depth 0`.

## Smoke test
```sh
cd examples/jimp-invert && ./run.sh
# expect: jimp-invert: OK
```
The fixture checks dimensions, both RGBA pixels after inversion, successful PNG reopen, and the recorded PNG hash.

## Recipe
```js
import { intToRGBA, Jimp, rgbaToInt } from "jimp";

const image = new Jimp({ width: 2, height: 1, color: 0x00000000 });
image.setPixelColor(rgbaToInt(10, 20, 30, 255), 0, 0);
image.invert();
await image.write("output/inverted.png");
const reopened = await Jimp.read("output/inverted.png");
const pixel = intToRGBA(reopened.getPixelColor(0, 0));
```
This is the fixture's operation pattern, not a performance recommendation.

## Troubleshooting
- Package resolution fails: run the install command from the project root and confirm `jimp` is listed there.
- Pixel checks fail: inspect channel order and alpha separately; the fixture expects RGBA and preserves alpha while inverting RGB.
- Output hash differs: compare decoded pixels and Jimp version first; do not assume every encoder/build produces the same PNG bytes.

## Official docs
- [Jimp API reference](https://jimp-dev.github.io/jimp/api/)
- [Jimp class API](https://jimp-dev.github.io/jimp/api/jimp/classes/jimp/)
- [Version 1.6.1 release](https://github.com/jimp-dev/jimp/releases/tag/v1.6.1)
