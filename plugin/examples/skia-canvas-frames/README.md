# skia-canvas Canvas 2D frames to PNG and outlined SVG

## Intent and scope

- Tool/version: `skia-canvas` 4.0.1 (MIT), prebuilt native binary via npm optional dependency; resvg 0.47.0 and ImageMagick used only to check the output.
- Claim: ordinary Canvas 2D code, a pure function of `t`, renders in Node with no browser to 640x360 PNG frames (CPU raster, local font registered from a file) and, from the same calls, an SVG whose text is outlined to paths; bytes are identical across two processes.
- Exclusions: GPU rendering, PDF, multi-page, other OS or CPU (cross-platform byte equality), system-font fallback, `Window`, filters, large frame counts and speed.
- Official documentation: https://github.com/samizdatco/skia-canvas and https://skia-canvas.org; checked 2026-11-27.
- Environment: macOS arm64; Node 22.19.0.
- Input: the scene in `render.mjs`; `fonts/JetBrainsMono-Bold.ttf` (OFL, `fonts/OFL.txt`).
- Output: ignored `output/`.

## Plan, before running

- Run `./run.sh --record`, then `./run.sh`.
- Assert: PNG and SVG hashes identical across two `node render.mjs` processes; three PNGs 640x360 with pixel probes matching `expected/metrics.json` (bar and disc move with `t`); SVG has no `<text>` or font references; resvg rasterises the SVG at 640x360.
- Inspect a contact sheet of the PNGs and the SVG raster. Stop if the font falls back, text is missing or hashes differ.

## Observation

Executed 2026-11-27 on `Conors-MacBook-Pro-2.local`. Record and verify runs passed. The contact sheet showed the bar and disc moving with `t`, JetBrains Mono Bold text (registered from the file) correct, and the resvg raster of the SVG visually matching the PNG. Hashes are recorded in `expected/metrics.json` for this machine only; they are not claimed to hold on other platforms. SVG output has no `viewBox`, only width and height.
