---
name: motion-canvas
description: Use Motion Canvas to author TypeScript generator-based vector animation projects in its editor and export image sequences. The VCR fixture validates one small editor-driven transparent PNG sequence on macOS.
---

# Motion Canvas

## Use cases and limits

- Choose it for code-authored explainers and vector animation with an interactive editor. Use Manim for math-heavy scenes; use browser tools when animating an existing DOM page.
- VCR evidence covers Motion Canvas 3.17.2's editor image-sequence exporter for one 64×48 scene, repeated twice on the same macOS arm64 host. It does not establish video/audio export, arbitrary projects, cross-platform determinism or a headless CLI renderer.

## Capability map

- **Projects and scenes** — [Quickstart](https://motioncanvas.io/docs/quickstart/) and the [documentation index](https://motioncanvas.io/docs/). The fixture uses one `makeScene2D` scene and a `Circle` held for 0.2 seconds.
- **Animation and signals** — available from the official documentation index. These are core authoring surfaces but are not exercised by the static one-circle fixture.
- **Rendering** — [rendering overview](https://motioncanvas.io/docs/rendering/) and [image-sequence exporter](https://motioncanvas.io/docs/rendering/image-sequence/). The fixture tests the editor UI's PNG-sequence path only.
- **Media and audio** — [media docs](https://motioncanvas.io/docs/media/). Not tested by this fixture.

## Install and doctor

The fixture pins Motion Canvas packages at 3.17.2 and local tooling in its lockfile:

```bash
cd examples/motion-canvas-render
npm ci
npm run build
```

The browser path defaults to `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`; set `CHROME_BIN` if needed. `vcr doctor` uses the catalogue package check and does not validate the editor workflow.

## Smoke test

From the example directory, run `./run.sh --record` only when intentionally reviewing a new baseline; then run `./run.sh` to compare with retained evidence. The script launches Vite and Chrome, then clicks the editor's Render control twice.

```text
# expect: JSON report with status "pass", 11 frames at 64×48, identical frame hashes across both renders
```

The runtime report includes machine-specific browser, Node and OS versions. The fixture rejects a different Chrome version until its evidence is reviewed and updated.

## Troubleshooting

- If the local editor does not start, check that port 9047 is available or set `MOTION_CANVAS_PORT` to another free port.
- If Chrome is not found, set `CHROME_BIN` to its executable path. A different Chrome version fails intentionally and needs a reviewed evidence update.
- If frame counts, bounds or repeat hashes differ, inspect `output/` and compare against `expected/render.json`; do not overwrite the baseline before review.

## Official docs

- [Motion Canvas documentation](https://motioncanvas.io/docs/)
- [Quickstart](https://motioncanvas.io/docs/quickstart/)
- [Rendering](https://motioncanvas.io/docs/rendering/)
- [Image-sequence exporter](https://motioncanvas.io/docs/rendering/image-sequence/)
