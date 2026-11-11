# Paper.js vector capture

## Intent and scope
Paper.js 0.17.0 (`paper-core.min.js`, JavaScript API, no PaperScript); the VCR job is a smoothed open path, a boolean-united shape and a radial-gradient-filled circle, each set from `t` and drawn by an explicit `paper.view.update(true)` with `view.autoUpdate = false` and no `view.onFrame`. Proves: 90 alpha PNG frames at 1280x720, 30 fps, from a seek-driven scene; shuffled capture equals sequential. Excludes SVG export, PaperScript, interaction and hit testing, stroke profiles, offset/outline, other browsers and GPU behaviour. Procedural original shapes; no media or fonts. Code MIT, checked 2026-11-11: the installed `paper@0.17.0` package `LICENSE.txt` and the npm registry `license` field; card https://paperjs.org/ (docs). No codec, model or asset dependency.

## Plan, before running
On macOS arm64, pinned `paper@0.17.0` installed locally in this pnpm workspace (pre-approved); reuse Playwright 1.64.1 and tsx 4.23.15. Run `pnpm install`, then `examples/paperjs-capture/run.sh --record`, visually inspect frame 45 at 1280x720 and the contact sheet, then `examples/paperjs-capture/run.sh`. Record the exact browser version from the capture report. No system-wide changes; the lockfile change is not committed.

Predeclared checks: 90 frames at 30 fps, 1280x720, at least two distinct frame hashes, every shuffled hash equal to sequential, frame 45 alpha minimum 0 and maximum 1. Assert these before recording `expected/summary.json`. Stop on missing dependencies, blank output, a clipped or empty union or gradient in the contact sheet, or any mismatch. Intended consumer is the existing browser capture harness; units are seconds and pixels. Transparent PNG sequence only; no delivery byte budget or compression claim. Outputs and reports in ignored `output/`; delete that directory to clean up. No cross-machine byte equality asserted.

## Observation, after running
2026-11-11, evidence-runner agent on Conors-MacBook-Pro-2.local, macOS Darwin 25.6.0 arm64, Node 22.19.0, Paper.js 0.17.0 (`paper-core.min.js`), Playwright 1.64.1, Chromium 156.0.8078.4 (queried from the installed Playwright), ImageMagick 7.1.2-15. Screenshot capture route, Canvas 2D backend. GPU details unknown and not claimed.

Both commands exited 0. `--record` wrote 90 frames; the second run printed `paperjs-capture: OK`. Sequential and shuffled hashes matched for all 90 frames (`mismatched_frames` empty); all 90 frame hashes were distinct. Frame 45 alpha was 0 to 1. Measurements are in `expected/summary.json`; hashes are in the ignored `output/report.json`.

Inspected the contact sheet (frames 0, 15, 30, 45, 60, 75) and frame 45 at native 1280x720: a smoothed blue curve that bends with the moving middle control point; a lime union of a rounded rectangle and a moving circle, with no seam or missing boolean lobe; an orange radial-gradient circle fading to transparent at its edge; transparent background. No clipping, blank frames or fixture defects seen. Agent visual review only; no human approval claimed.

Result: pass for the stated claim. Does not establish interaction, hit testing, SVG export, PaperScript, other browsers, GPU behaviour or cross-platform byte equality. The scene calls `view.update(true)` on every seek because `update()` skips redraws when no item changed; with `autoUpdate` off and no `onFrame`, the only redraw is the explicit update. Revalidate on Paper.js, Playwright or Chromium changes.
