---
name: svg
description: Static and scripted SVG as a native, dependency-free source format for title cards, logos, diagrams and vector motion in VCR, with the choice between SMIL, GSAP and rasterisation by resvg or the browser. Use when the source should stay editable vector.
---

# SVG

The one source format every tool here can read. Static SVG rasterises deterministically with resvg; animated SVG runs through a browser with GSAP.

## Use cases and limits
- Title cards, lower thirds, logos, diagrams from Graphviz or Mermaid, stroke-draw reveals, icon motion.
- Over a canvas library when the asset must stay editable by a designer; over bitmap when it must scale to any delivery size.
- Not for photographic content, 3D, or heavy filter effects at 4K (SVG filters are slow in browsers).

## Install and doctor
Nothing to install. Rasterisation needs resvg (`skills/resvg`) or the capture harness.

## Smoke test
```text
examples/native-svg/run.sh
# expect: native-svg: OK
```

## Static authoring
- Always set `viewBox` and omit fixed `width`/`height` on the root unless the asset is a fixed-size card; resvg and browsers then scale cleanly.
- Give every element an agent will touch a stable `id`; SVGO's `cleanupIds` must be disabled for animated files (`svgo --disable=cleanupIds`).
- Text: convert to paths for portability (`inkscape --export-text-to-path`) or ship the font and reference it by family. resvg lists what it can resolve with `--list-fonts`.
- Colour and layout live in the SVG; motion does not. Keep them separate so the brand file can change without touching the timeline (PRD principle 4).

## SMIL versus script
- SMIL (`<animate>`, `<animateTransform>`) is declarative and plays in browsers, but cannot be seeked reliably from outside and is ignored by resvg. Do not use it for VCR renders.
- Script: load the SVG inline in a scene page and animate with GSAP (`skills/gsap`). `DrawSVGPlugin` for stroke reveals, `MorphSVGPlugin` for shape morphs, `MotionPathPlugin` to move along a path.
- Stroke-draw by hand: set `stroke-dasharray` and tween `stroke-dashoffset` from the path length (`path.getTotalLength()`).

## Rasterisation
- Static: `resvg --width 1080 in.svg out.png`. Deterministic per resvg version; hash the PNG as evidence.
- Animated: the capture harness renders the scene page; `captureMode: "beginframe"` works for SVG-only pages (no canvas) at about 60 frames per second.
- Browser and resvg rasterise anti-aliasing differently; pick one per production and record it in the render manifest.

## Troubleshooting
- Blurry output: the root has a fixed small `width`/`height` and was scaled up; use `viewBox` and let the rasteriser size it.
- Missing glyphs in resvg: the font is not installed; convert to paths.
- An animation plays in the browser but not in capture: it is SMIL or CSS; move it to GSAP.

## Official docs
https://developer.mozilla.org/en-US/docs/Web/SVG · https://www.w3.org/TR/SVG2/
