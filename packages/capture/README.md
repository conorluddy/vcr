# @vcr/capture

Deterministic frame capture of a browser scene, extracted from the browser-capture spike once p5 and Three needed the same loop.

```ts
import { captureFrames } from "@vcr/capture";
const report = await captureFrames({ sceneFile: "/abs/scene.html", width: 1280, height: 720, fps: 30, outputDirectory: "output/frames", verifyDeterminism: true });
```

## Scene contract
The page sets `window.__scene = { duration, seek }`. `seek(t)` must be pure and must schedule any canvas or WebGL render on `requestAnimationFrame` rather than drawing synchronously; a synchronous draw blocks on the compositor while the compositor waits for the harness.

## Modes
- `screenshot` (default): settles two animation frames, then `page.screenshot`. Deterministic for DOM, 2D canvas and WebGL. About 12 frames per second at 1280x720 including the determinism re-run.
- `beginframe`: `HeadlessExperimental.beginFrame` under `--deterministic-mode`. About 60 frames per second at 1080p for DOM-only pages, but hangs on any page with a canvas.

## Runtime and the CLI

`vcr capture <scene.html> --width --height --fps [--verify]` is the same engine for workspaces outside this repository. Playwright is loaded lazily: `playwrightRuntimeDirectory` points at a directory whose `node_modules` holds it (the CLI passes `~/.vcr/runtime`, installed by `vcr setup capture`); omitted, normal resolution applies. `chromiumArgs` adds flags; the CLI passes `--single-process` inside the Codex sandbox, where captures stay byte-identical (spike S1 addendum). `VCR_CHROMIUM_EXTRA_ARGS` and `VCR_CAPTURE_MODE` still work as environment overrides.

## Serving

`sceneFile` serves the page's directory over loopback HTTP so ES module imports and `node_modules` references resolve; `file://` blocks module imports.

Full captures remove existing numbered `frame-*.png` files in the output directory before writing the new sequence, so shortening a scene cannot leave an old tail. An explicit `frames` list updates only the requested frames. Other files are preserved. The scene server closes even when Chromium fails to launch or close.

Chromium partial rasterization is disabled because reused tiles can make fractional DOM/SVG transforms depend on earlier frames. Verify a scene with shuffled captures before recording determinism evidence.
