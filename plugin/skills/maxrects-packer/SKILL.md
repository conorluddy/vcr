---
name: maxrects-packer
description: Pack rectangles (sprites, glyphs, frames) into fixed-size atlas bins in Node with maxrects-packer and read back each x and y. Load once an atlas or tile layout has to be computed; it places rectangles only and does not draw the atlas.
---

# maxrects-packer

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this file; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Sizes in, positions out: `add(width, height, data)` then read `packer.bins[n].rects`. No pixels are handled; draw the atlas with `sharp`, `imagemagick` or SVG.
- VCR evidence covers 24 seeded rectangles, 256x256 bins, padding 2, the `smart` option and no rotation, with 3.0.0 on macOS arm64 and Node 22. Everything else below is marked untested.
- For distance-field glyphs use `msdfgen`; for arbitrary polygons use `clipper2`.

## Capability map
| Area | Official reference | VCR |
| --- | --- | --- |
| `MaxRectsPacker` add, bins, padding | [README](https://github.com/soimy/maxrects-packer#readme) | tested |
| `smart` option | README | set; effect not isolated |
| `pot`, `square`, `allowRotation`, `logic`, `border` | README | untested |
| `MaxRectsBin`, `OversizedElementBin`, `addArray`, remove and repack | README | untested |

## Install and doctor
```sh
pnpm add maxrects-packer@3.0.0
```
A project-local library: `vcr doctor` does not probe it. Pin the exact version.

## Smoke test
```sh
cd examples/maxrects-atlas-pack && ./run.sh
# expect: OK: maxrects-atlas-pack
```
Packs twice in separate processes and requires an identical layout, then checks every rectangle is placed once at its own size inside its bin, none overlap, and padding is kept; it draws each bin through resvg.

## Recipe: pack and read positions
```js
import { MaxRectsPacker } from 'maxrects-packer';
const packer = new MaxRectsPacker(256, 256, 2, { smart: true, pot: false, square: false });
for (const s of sprites) packer.add(s.width, s.height, { id: s.id });
const layout = packer.bins.map((bin) => bin.rects.map((r) => ({ id: r.data.id, x: r.x, y: r.y, width: r.width, height: r.height })));
```
- The third argument is padding between rectangles; the fixture measured a minimum gap of exactly 2.
- When the first bin fills, the packer opens another one: 24 rectangles gave two bins (16 and 8).
- Rectangle sizes were returned unchanged.

## Determinism
Output depends on input order. The fixture sorts by height, width, then id before adding, and the layout hash was identical across processes (tested). Unsorted input order was not tested.

## Troubleshooting
- No failures were seen in the fixture.

## Official docs
- [maxrects-packer repository](https://github.com/soimy/maxrects-packer)
- [maxrects-packer on npm](https://www.npmjs.com/package/maxrects-packer)
