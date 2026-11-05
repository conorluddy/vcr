# Examples

Tier 3 of the catalogue tree: runnable fixtures, loaded one at a time. Each directory has:

- `example.json` — manifest validated by `catalog/schemas/example.schema.json`: id, the tool ids it demonstrates, status, the run command, and for browser examples a `capture` block (scene, width, height, fps). Tool records link back through `examples`; `pnpm validate` checks the link both ways.
- `run.sh` — reproduces the fixture and diffs against `expected/`; `run.sh --record` re-records after a deliberate change or tool upgrade.
- `expected/` — hashes and probe metadata, not media.
- `output/` — generated, ignored.

| Example | Demonstrates | Evidence |
| --- | --- | --- |
| `native-svg` | svg, resvg, ffmpeg-ffprobe | PNG hash and ffprobe metadata |
| `ffmpeg-assembly` | imagemagick, ffmpeg-ffprobe | 48 frames at 24 fps mux to exactly 2.000000 s |
| `blender-smoke` | blender | one 320x240 RGBA frame from the app bundle |
| `browser-capture` | gsap, playwright | shuffled-order capture matches sequential; spike report |
| `p5-capture` | p5-js, playwright | seeded sketch, deterministic in any order |
| `three-capture` | three-js, playwright | WebGL scene with alpha, deterministic in any order |
| `anime-capture` | anime-js, playwright | v4 timeline seeked per frame with alpha, deterministic in any order (2026-11-05) |

All six were validated on the primary Mac on 2026-10-26. Browser examples use `packages/capture`; their scenes expose `window.__scene = { duration, seek }` and schedule canvas renders on an animation frame.

## Outside this repository

`vcr example create <id>` copies an example into `<workspace>/examples/<id>` and prints the commands to run it. Browser examples arrive without `capture.ts`, `run.sh` and `expected/` (they depend on this pnpm workspace) and with a standalone `package.json`; render them with `vcr capture` using the `capture` block. Native examples (`native-svg`, `ffmpeg-assembly`, `blender-smoke`) keep their standalone `run.sh` and `expected/`. `*.test.ts`, `node_modules/` and `output/` never travel.
