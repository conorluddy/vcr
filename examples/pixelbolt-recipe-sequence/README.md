# pixelbolt recipe-sequence fixture

## Intent and scope

- **Tool/version:** pixelbolt 0.21.0 (npm, MIT, zero dependencies), pinned in `package.json` and installed locally by `pnpm install`. The lead said 0.18.0; the registry showed 0.21.0.
- **Claim:** one JSON pixel-art recipe renders to an exact-palette sprite sheet and atlas, and to a numbered 1080p alpha PNG sequence with the recipe's timing, repeatably.
- **Exclusions:** fx, fluid, wave, bodies, crystal, powder, scene and MCP surfaces; GIF and APNG; ffmpeg encoding of the sequence; art quality beyond one small slime.
- **Input:** `slime.json`, written for this fixture (12x10, four palette colours, three frames, two animations), no external files.
- **Environment:** macOS arm64, Node 22.19 (engines: >=20). No machine install; `run.sh` runs `pnpm install` into the example if `node_modules` is missing.
- **Licence:** MIT (package `LICENSE`, checked 2026-11-27). No model or network service.
- **Side effects:** the CLI wrote only under `output/` (ignored). The skills installer with telemetry is never run.

## Plan, before running

- **Commands:** `./run.sh --record`, then `./run.sh`. `run.mjs` runs `render --look` twice and `sequence --fps 30 --size 1080p --animation idle --seconds 1` twice, then checks.
- **Predeclared checks (all gating):** version is 0.21.0; sheet is 36x10 with at least three atlas frames; sheet pixels are only the four palette colours (or alpha 0); alpha is binary; sheet pixel (0,5) is the outline colour exactly; sequence is 30 PNGs at 1920x1080; frames 1-9 identical (rest 300 ms), 10-15 identical and different (up 200 ms); frame 16 equals frame 1 (15-frame loop); the 108x block scale places source pixel (0,5) at the predicted spot and leaves the pillarbox transparent; both render trees and both sequence trees are byte-identical across runs.
- **Stop conditions:** a failed check stays in `expected/metrics.json`, prints `KNOWN FAIL`, evidence becomes partial; no check is loosened.
- **Inspect:** a frame at 25% and `output/render-a/slime.png` at 8x nearest-neighbour.

## Observation, after running

- **Date and executor:** 2026-11-27, onboard-pixelbolt worker.
- **Result: pass.** 11 of 11 checks on the first run; `./run.sh` exits 0 and prints `pixelbolt-recipe-sequence: OK`. Hashes and sizes are in `expected/metrics.json`.
- **Inspection:** the slime reads as crisp blocks with hard edges, the up frame sits one source pixel (108 px) higher, and the sheet shows three frames side by side.
- **Does not establish:** other recipe kinds, other versions, other platforms, GIF/APNG, MCP, or what the sequence looks like once encoded by ffmpeg.
