# Motion Canvas editor render fixture

## Intent and scope

- **Tool/version:** Motion Canvas 3.17.2 (`@motion-canvas/core`, `@motion-canvas/2d`, UI and Vite plugin); Vite 4.5.14.
- **Claim:** the documented editor workflow can render a TypeScript scene to a PNG image sequence on the local machine.
- **Exclusions:** video encoding, audio, other exporters, arbitrary project features, seek-order determinism, cross-platform equivalence and visual quality beyond the checked geometric output.
- **Documentation and licence:** [Quickstart](https://motioncanvas.io/docs/quickstart/), [rendering](https://motioncanvas.io/docs/rendering/), [Motion Canvas repository](https://github.com/motion-canvas/motion-canvas); MIT licence. Checked 2026-11-16.
- **Environment:** macOS arm64, Node 25.6.1, Vite 4.5.14 and Chrome 157.0.8103.51, recorded in `expected/render.json`.
- **Input and dependencies:** an owned 24 px lightseagreen circle held for 0.2 seconds; pinned npm dependencies and local Chrome (default `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`, or set `CHROME_BIN`). No external media or network render service.
- **Side effects:** starts a local Vite server, launches a headless browser and writes PNGs under ignored `output/`.

## Plan, before running

- **Commands:** `./run.sh --record`, then `./run.sh`; each installs pinned packages, builds the Vite project, starts the editor and presses its `Render` action with 64×48 output settings.
- **Checks:** successful project build; 11 PNG files at 64×48; each frame has 476 nontransparent pixels within bounds `[20,12,44,36]`; per-frame PNG SHA-256 hashes match across two editor renders; runtime versions are recorded exactly.
- **Stop conditions:** missing compatible Chrome, editor startup or render failure, wrong frame count/dimensions/alpha bounds, inconsistent repeated hashes, or changed tool/runtime versions.
- **Inspection:** inspect `output/project/000000.png` at native and enlarged scale; output images are not retained in the repository.

## Observation, after running

- **Result:** pass. `./run.sh --record` and a separate `./run.sh` clean-install verification passed. Both runs rendered the editor's image-sequence exporter twice and compared the resulting frame hashes.
- **Measurements:** both renders produced 11 transparent 64×48 PNGs. Every frame has 476 nontransparent pixels within `[20,12,44,36]`; SHA-256 for each frame is `9c3e07ff760bed04a47635449ceb60931dcf88e0720f644164ea6513fa860042`.
- **Runtime:** Motion Canvas packages 3.17.2, Vite 4.5.14, Node v25.6.1, Chrome 157.0.8103.51, macOS 26.6 arm64 (Darwin 25.6.0), host `Conors-MacBook-Pro-2.local`.
- **Visual inspection:** inspected frame 000000 at native size. It contains the centered lightseagreen circle on transparency; the alpha bounds and frame hashes are numeric checks, not a quality assessment.
- **Limits:** this validates one editor-driven PNG sequence on one macOS host. It does not establish video export, arbitrary project behavior, cross-platform determinism, or a headless CLI render route.
