# @vcr/lint

Layout checks for browser scenes, driven by `vcr lint`. It opens the scene with `openScenePage` from `@vcr/capture`, seeks each sample time, lets it settle and measures layout in the page. The method comes from Grapla's lint (#46, #59).

| Rule | What it means |
| --- | --- |
| `TYPO-SAFE` | Visible text (`Range.getClientRects()`) crosses the selected safe-zone rectangle |
| `out-of-frame` | Visible text extends past the viewport |
| `overflow` | A box whose `overflow` is not `visible` has scroll size greater than client size + 1 px |
| `root-zero-height` | The first laid-out child of `body` has zero height |

Key decisions:
- **Limits come from data.** Safe-zone presets are read at runtime from `references/typography/rules.json` under the harness root. Nothing numeric lives in this package. Findings that rely on a preset marked `verified: false` carry `verified: false`.
- **Measurement is separate from judgement.** `measure-page.ts` runs in Chromium and returns plain rectangles. `findings.ts` is pure and unit-tested.
- **One finding per scene, selector and rule.** Across samples, the worst one is kept.

Gotchas:
- **Text inside an overflowing box is skipped.** The overflow finding already covers it. `html` and `body` are never overflow candidates, because text leaving them is `out-of-frame`.
- **Canvas and WebGL text is invisible to the DOM.** A scene can expose `window.__scene.textBounds()`, which returns `[{ x, y, width, height, label? }]` in CSS pixels for the current time. A canvas scene with neither that method nor visible DOM text is reported as *unable to assess*. That is never a pass and never a failure.
- **Sampling order:** `--at`, then `--markers` (`window.__scene.markers`, in seconds, e.g. just before each beat ends), then `--samples` evenly spaced times from 0 to one frame before the end.
- **The `__name` shim.** `page.evaluate` serialises `measurePage`. esbuild, through tsx and the plugin bundle, can wrap its inner functions in `__name()`, so lint defines a no-op `__name` in the page first.
