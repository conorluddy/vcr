---
name: gsap
description: Author seekable motion for browser-rendered scenes with GSAP timelines, eases, MotionPath and SplitText, and capture them deterministically frame by frame. Use for title cards, kinetic type, UI motion and any 2D animation that VCR renders through a browser.
---

# GSAP

The timeline library for every browser scene in VCR. One paused timeline per scene, seeked by the harness; nothing animates on its own clock.


`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`. Run it from the workspace (the directory holding `vcr.json`).
## Use cases and limits
- Kinetic typography, title cards, SVG and DOM motion, orchestrating several elements with one clock.
- Not a renderer: it writes CSS transforms and attributes; the browser rasterises. Pixel output depends on Chromium, which the capture harness pins.
- Licence: GSAP standard licence, free including the former club plugins since 3.13. Recheck before commercial use.

## Install and doctor
```text
npm install gsap
node -e "console.log(require('gsap/package.json').version)"
```
Validated 3.x with Chromium 156 via `examples/browser-capture`, and 3.15.0 on Linux with a Chrome for Testing 153 stand-in (2026-11-04).

## Smoke test
```text
vcr example create browser-capture                 # copies the scene into examples/browser-capture, prints these steps
npm install --prefix examples/browser-capture
vcr setup capture --yes                 # once per machine: Playwright + Chromium into ~/.vcr
vcr capture examples/browser-capture/scene.html --width 1920 --height 1080 --fps 30 --verify
# expect: captured 90 frames; shuffled matches sequential: true
```

## Scene contract
```js
gsap.defaults({ force3D: false, lazy: false });   // one transform path, no deferred first write
const tl = gsap.timeline({ paused: true });
tl.to("#title", { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }, 0.2);
window.__scene = { duration: tl.duration(), seek: (t) => { tl.seek(t, true); } };
```
Never return the timeline from code the harness evaluates; it is a cyclic object and serialising it hangs the call. Never use `repeat: -1`, `Date.now()` or unseeded randomness.

## Timeline
- Position parameters are absolute seconds (`0.2`), relative (`"+=0.1"`, `"<"`, `">"`) or labels (`tl.addLabel("beat", 1.5)`). Prefer labels for anything a marker will reference.
- `tl.duration()` is the scene's duration. Nested timelines (`tl.add(child, 0.5)`) keep their internal motion when moved, which is exactly PRD L2's rule.
- `seek(t, true)` suppresses callbacks; `seek(t, false)` fires them. Callbacks must never determine visual state (PRD §9).
- Derived state (a counter, a clock, text built from a value): tween a plain object, then set the DOM from it after the seek, never in `onUpdate`. `const s = { n: 0 }; tl.to(s, { n: 100, duration: 2 }, 0); seek: (t) => { tl.seek(t, true); el.textContent = Math.round(s.n); }`.
- `timeScale` changes speed without changing authored keyframes; use it for preview, not for final timing.

## Eases
- Default to `power2.out` for entrances, `power2.inOut` for moves, `none` for opacity holds and crossfades.
- `back.out(1.7)`, `elastic` and `bounce` overshoot; give them room so the overshoot stays inside the frame.
- Custom curves: `CustomEase.create("name", "M0,0 C0.2,0 0.3,1 1,1")`. Record the string in the scene's parameters so a review can reproduce it.

## MotionPath
- `motionPath: { path: "#route", align: "#route", alignOrigin: [0.5, 0.5], autoRotate: true }` moves along an SVG path; the path can be hidden with `visibility: hidden`, not `display: none`.
- Paths are evaluated at seek time, so they are seek-safe. Convert `<line>`, `<polyline>` and `<rect>` with `MotionPathPlugin.convertToPath` first.

## SplitText
- `new SplitText("#headline", { type: "chars,words,lines" })` wraps glyphs for per-character animation. Call it once at build time, never inside seek.
- Lines depend on the font being loaded: wait for `document.fonts.ready` before building, and ship the font file with the project.
- Revert with `split.revert()` only in teardown; reverting mid-timeline changes layout and breaks determinism.

## Capture
Capture with `vcr capture <scene.html> --width W --height H --fps F --verify`; frames and `report.json` land in `output/` beside the scene (the same engine as `@vcr/capture`'s `captureFrames` inside the repository). Use the default screenshot mode. `VCR_CAPTURE_MODE=beginframe` is experimental: it hangs on canvas scenes and has hung on a DOM-only scene too (#52).

## Troubleshooting
- `--verify` reports a shuffled mismatch: see [Determinism pitfalls](../start/references/determinism.md).
- Frames differ between runs: a tween has `lazy` on, a CSS animation or transition is running alongside, or something reads the clock. Set `gsap.defaults({ lazy: false })` and remove CSS animations.
- Edge anti-aliasing flickers: `force3D: "auto"` switching transform paths; pin it to `false`.
- Text wraps differently in capture than in a browser window: the font was not loaded when SplitText ran.

## Official docs
https://gsap.com/docs/v3/ · https://gsap.com/docs/v3/Plugins/MotionPathPlugin/ · https://gsap.com/docs/v3/Plugins/SplitText/
