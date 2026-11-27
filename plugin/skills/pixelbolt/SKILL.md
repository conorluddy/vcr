---
name: pixelbolt
description: Author pixel art from a JSON recipe with the pixelbolt Node CLI and export a sprite sheet, atlas or numbered 1080p alpha PNG frames for video. VCR evidence covers pixelbolt 0.21.0, one small recipe, render and sequence, on macOS arm64.
---

# pixelbolt

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Turns a recipe (palette keys, grids, shapes, stamps, frames, animations) into exact-pixel sprites. Tested: `render` (sheet, atlas, frames) and `sequence` (numbered alpha PNGs at video size) on a 12x10 recipe.
- It authors pixel art; it does not process existing images (use `sharp`, `libvips` or `imagemagick`) and does not encode video (use `ffmpeg-ffprobe` on the sequence; `gifski` or `gifsicle` for GIFs).
- Not tested: `fx`, `fluid`, `wave`, `bodies`, `crystal`, `powder` and `scene` sources, `import`, `gif`, APNG, the MCP server, other versions.

## Capability map
Index: [README](https://github.com/skulitom/Pixelbolt#readme); `pixelbolt help [topic]` prints the same references offline.
- **Recipe and ops** (`pixel`, `rect`, `grid`, `stamp`, `outline`, `dither`, `shade`...): `help quickstart`, `help schema`. Grid, stamp, replace and `from`/`translate` frames tested.
- **Export:** `render --out dir [--look] [--scale n]`: sheet, atlas, Godot `.tres`, CSS, preview page. Sheet and atlas tested.
- **Video frames:** `sequence --fps --size 1080p --animation name --seconds s`. Tested.
- **Sources compiled by `compile`:** poses, autotile, fx, fluid, wave, crystal, powder, bodies, normals: untested.
- **Inspect and edit:** `validate`, `inspect`, `patch`: untested.

## Install and doctor
```sh
pnpm add pixelbolt@0.21.0   # inside the project; no system install, zero dependencies
node node_modules/pixelbolt/bin/pixelbolt.js help
```
A project dependency, so `vcr doctor` does not check it. Pin the version: the project releases quickly. Never run its skills installer (it reports telemetry unless `DISABLE_TELEMETRY=1`); the CLI needs none.

## Smoke test
```sh
examples/pixelbolt-recipe-sequence/run.sh
# expect: pixelbolt-recipe-sequence: OK   (after 11 "ok" check lines)
```

## Recipes (tested)
```sh
P="node node_modules/pixelbolt/bin/pixelbolt.js"
$P render slime.json --out out/render --look        # slime.png, slime.atlas.json, frames/, look.png
$P sequence slime.json --out out/seq --fps 30 --size 1080p --animation idle --seconds 1
```
- `sequence` writes `slime-idle_0001.png` onwards plus `sequence.json`; import as an image sequence at 30 fps and leave scale at 100%.
- Sprite scales by an integer (12x10 became 108x blocks, centred, with transparent pillarbox); only palette colours and alpha 0 or 255 appear.
- Poses hold for whole frames: 300 ms rest was 9 frames, 200 ms up was 6; the 15-frame idle loops exactly.
- Output is deterministic: two runs gave byte-identical trees, including `preview.html`.
- An existing output folder is refused; delete it or pass `--force`.

## Troubleshooting
- Nothing seen failing in the fixture. Errors go to stderr with exit 1, with the path of the bad field.

## Official docs
- [Repository and README](https://github.com/skulitom/Pixelbolt)
- [0.21.0 on npm](https://www.npmjs.com/package/pixelbolt/v/0.21.0)
