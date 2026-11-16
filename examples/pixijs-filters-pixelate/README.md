# PixiJS Filters PixelateFilter baseline and effect

## Intent and scope

- Tools and versions: PixiJS 8.23.0 with `pixi-filters` 6.1.5 (Filters v6 explicitly supports PixiJS v8); Playwright 1.64.1.
- Claim: a time-selected PixelateFilter changes an owned checker pattern in WebGL and yields stable effect output on repeat capture.
- Exclusions: other filters, WebGPU, hardware GPU backends, browser versions/OSes, and quality or performance claims.
- Sources: https://github.com/pixijs/filters (compatibility and filter list), https://filters.pixijs.download/main/docs/PixelateFilter.html; checked 2026-11-16.
- Environment: macOS 26.6 arm64, headless Chromium, ANGLE SwiftShader software backend; actual versions/backend are recorded at runtime.
- Input: procedural 128×128 two-color checker pattern authored in `scene.html`; no external assets.
- Dependencies are pinned in this fixture's npm package/lockfile; `output/` is ignored.

## Plan, before running

- Load PixiJS 8.23.0 and `pixi-filters` 6.1.5 from fixture-local browser bundles, initialize an explicit WebGL renderer, and draw a 128×128 checker pattern made from 4×4 cells.
- Drive the PixelateFilter size as `[1 + 11t, 1 + 11t]`: baseline at `t=0` (1×1) and effect at `t=1` (12×12). Assert the captured PNGs differ by at least 500 pixels; capture `t=1` twice and require identical hashes.
- Record browser version and unmasked WebGL renderer/vendor. Inspect the baseline and filtered images at native scale; stop on filter import/shader error, empty output, insufficient difference, or nondeterministic effect capture.
- Reproduce with `npm ci && ./run.sh`.

## Observation

Executed twice in fresh Chromium processes on 2026-11-16 by the maintainer on `Conors-MacBook-Pro-2.local`. PixiJS 8.23.0 and `pixi-filters` 6.1.5 rendered the owned 4×4 checker cells at PixelateFilter sizes 1 and 12. The images differed at 15,365 pixels; repeated size-12 captures matched. Chromium 156.0.8078.4 used ANGLE SwiftShader / Vulkan software rendering, not a physical GPU. Baseline and effect were inspected at 128×128: the baseline preserves the fine checkerboard and the effect collapses it into broad pixel blocks. No external resources were requested. This result covers only PixelateFilter on this checker input and backend.
