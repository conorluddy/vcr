# occt-wasm bracket to STEP, STL and hidden-line SVG

## Intent and scope

- Tool/version: `occt-wasm` 5.18.6 (OpenCascade V8 in WebAssembly), npm, installed only inside this example.
- Claim: one exact solid (60x30x10 mm plate, four corner fillets, two 4 mm holes) is built in Node with no Python, round-trips through STEP with the same volume, tessellates, and draws hidden-line views as an SVG that resvg rasterises.
- Exclusions: browser, Web Worker, XCAF assemblies and glTF export, sweeps and lofts, importing foreign STEP, other platforms, STEP timestamp (the header stamps export time).
- Official documentation: https://github.com/andymai/occt-wasm README and the shipped `dist/*.d.ts`; checked 2026-11-27. Licence: wrapper MIT OR Apache-2.0, WASM LGPL-2.1-only.
- Environment: macOS 26.6 arm64; Node 22.19.0; resvg 0.47.0; ImageMagick for the size check.
- Input: constants in `render.mjs`; no external assets.
- Output: ignored `output/` (`bracket.step`, `.stl`, `.svg`, `.png`, `metrics.json`).

## Plan, before running

- Run `./run.sh --record`, then `./run.sh`.
- Assert: analytic volume 18000 - 4(1-pi/4)(3^2)(10) - 2 pi 4^2 10 = 16917.43 mm3 matches the kernel and the STEP re-import; bounding box 60x30x10; STL, SVG and timestamp-free STEP hashes identical across two separate processes; resvg at `--width 1000` gives 1000x1046.
- Inspect the PNG at native size. Stop if a view is wrong or hidden edges are missing.

## Observation

Executed 2026-11-27 on `Conors-MacBook-Pro-2.local`; both runs passed. Volume 16917.434 mm3 matches the analytic value and the re-imported solid. The first run failed the predeclared determinism check: the STEP `FILE_NAME` header carries a to-the-second timestamp. STL and SVG were byte-identical; the STEP body is identical once that timestamp is blanked, so the metric hashes the STEP without it (the check was narrowed to a known stamp, not removed). The PNG shows Front, Top, Right and Iso views with dashed hidden hole edges and a `60 x 30 x 10` annotation; round holes are drawn as 12-sided polygons, so HLR output is coarse for curves. Does not establish browser use, glTF, or other machines (OCCT float output may differ across CPUs).
