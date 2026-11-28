---
name: svg
description: Static and scripted SVG as a native, dependency-free source format for title cards, logos, diagrams and vector motion in VCR, with the choice between SMIL, Web Animations API and rasterisation by resvg or the browser. Use when the source should stay editable vector; for hundreds of animated elements or pixel effects use `pixijs` or `canvas-2d` instead.
---

# SVG

The one source format every tool here can read. Static SVG rasterises deterministically with resvg; scripted motion runs through a browser with Web Animations API or Anime.js.


`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`. Run it from the workspace (the directory holding `vcr.json`).
## Use cases and limits
- Title cards, lower thirds, logos, diagrams from Graphviz or Mermaid, stroke-draw reveals, icon motion.
- Over a canvas library when the asset must stay editable by a designer; over bitmap when it must scale to any delivery size.
- Not for photographic content, 3D, or heavy filter effects at 4K (SVG filters are slow in browsers).

## Capability map
- **Document structure and graphics** — SVG 2 elements, groups, paths, shapes, text, paint, gradients, patterns, clipping, masks, filters and coordinate systems; authoring/reference surface is the SVG specification. Fixture uses a static title-card subset only.
- **Animation and interaction** — SMIL elements and browser scripting can animate SVG. Web Animations API and Anime.js can be driven by the VCR scene clock; this guide's retained fixture only rasterises one static SVG through resvg.
- **Evidence boundary** — the spec describes format capabilities, not VCR support. Validated: one static SVG rasterised by resvg (`examples/native-svg`), and six inline SVG groups with embedded `<image>`, `feDropShadow` and paused `element.animate()` in Chromium 156 on macOS arm64 (`examples/svg-paper-collage`). Untested: other browsers, photographs, other filters, SMIL, Anime.js-driven SVG on this page, 4K.

## Install and doctor
Nothing to install. Rasterisation needs resvg (`skills/resvg`) or the capture harness.

## Smoke test
```text
vcr example create native-svg && (cd examples/native-svg && ./run.sh)
# expect: native-svg: OK
vcr example create svg-paper-collage && (cd examples/svg-paper-collage && ./run.sh)
# expect: svg-paper-collage: OK (<fps> fps)   # fps varies; one recorded run was about 15
```
Evidence: `native-svg` is a static file through resvg, no browser. `svg-paper-collage` is Chromium 156.0.8078.4 and Playwright 1.64.1 on macOS arm64: 90 frames at 1280x720, shuffled equals sequential, alpha at frame 0, last frames identical. The platform has no version of its own (`n/a`).

## Static authoring
- Always set `viewBox` and omit fixed `width`/`height` on the root unless the asset is a fixed-size card; resvg and browsers then scale cleanly.
- Give every element an agent will touch a stable `id`; SVGO's `cleanupIds` must be disabled for animated files (`svgo --disable=cleanupIds`).
- Text: convert to paths for portability (`inkscape --export-text-to-path`) or ship the font and reference it by family. resvg lists what it can resolve with `--list-fonts`.
- Colour and layout live in the SVG; motion does not. Keep them separate so the brand file can change without touching the timeline (PRD principle 4).

## SMIL versus script
- SMIL (`<animate>`, `<animateTransform>`) is declarative and plays in browsers, but cannot be seeked reliably from outside and is ignored by resvg. Do not use it for VCR renders.
- Script: load the SVG inline in a scene page and animate with Anime.js (`skills/anime-js`) or paused Web Animations API (`skills/web-animations-api`).
- Stroke-draw by hand: set `stroke-dasharray` and tween `stroke-dashoffset` from the path length (`path.getTotalLength()`).

## Rasterisation
- Static: `resvg --width 1080 in.svg out.png`. Deterministic per resvg version; hash the PNG as evidence.
- Animated: the capture harness renders the scene page; `captureMode: "beginframe"` works for SVG-only pages (no canvas) at about 60 frames per second.
- Browser and resvg rasterise anti-aliasing differently; pick one per production and record it in the render manifest.

## Techniques
Technique records that route through this tool; read the record (`vcr techniques info <id> --full`) before building.
- `paper-collage` (tested): per-piece `<g>` with an irregular mat path, embedded `<image>` and `feDropShadow`, slid in by paused `element.animate()`, see `examples/svg-paper-collage`. Edge and premultiplication rules: `FX-MASK-EDGE`, `FX-PREMULT-EDGES`.
- `hand-drawn-sketch` and `line-boil`: seed from stepped scene time, never the wall clock (`FX-SEED-DECLARED`, `FX-NO-WALLCLOCK`). Untested here.
- `card-stack`, `carousel`, `lockup-reveal`, `progress-sweep`, `wipe-transition`: vector authoring only is claimed (stable ids, one group per part, `viewBox`); their motion belongs to `skills/anime-js` or `skills/web-animations-api`. Untested on this page.

## Troubleshooting
- Blurry output: the root has a fixed small `width`/`height` and was scaled up; use `viewBox` and let the rasteriser size it.
- Missing glyphs in resvg: the font is not installed; convert to paths.
- Frame rate drops with `feDropShadow` on many groups (about 15 fps captured in the collage fixture): expected, correctness is unaffected.
- An animation plays in the browser but not in capture: ensure every `Animation` is paused and its `currentTime` is set from the requested scene time.

## Official docs
- Overview and element/API references: https://developer.mozilla.org/en-US/docs/Web/SVG
- SVG 2 specification: https://www.w3.org/TR/SVG2/
