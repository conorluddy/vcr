# Determinism pitfalls in browser scenes

`vcr capture --verify` captures every frame twice, the second time in shuffled order, and fails if any frame's hash differs. A mismatch means the pixels depend on which frames came before, so a re-render or a partial re-capture would not match. Each pitfall below was found in a real run.

## Find the cause

1. Check the DOM first. Seek frame N after two different histories and compare the animated elements' inline styles and attributes. If they differ, the scene (or library) carries state between seeks. If they match, the renderer is the cause: see pitfalls 1 and 3.
2. Bisect. Remove one tween at a time and rerun `--verify`. Elements that pass alone can fail together (pitfall 3).
3. Note where the mismatches start. A run that starts failing at the frame where one tween ends points at that tween or at what it overlaps.

## 1. Scaling a gradient

Animating `scale` on an element with a `radial-gradient` background re-rasterises it differently depending on frame history: 171 of 182 frames mismatched, even with `--disable-partial-raster`.

```css
/* bad: tween scale on .glow */  .glow { background: radial-gradient(#fff, transparent); }
/* good: fix the size, tween opacity instead (and pin it, see 3) */  .glow { will-change: opacity; }
```

## 2. Transform on an unsized wrapper

A transform on a wrapper with no size collapses `inset: 0` children to zero height, so the background vanishes. A no-op `fromTo('#stage', { x: 0 })` is enough to cause it. Not a hash mismatch, but the same class of trap: looks fine until the transform is added.

```css
/* good: give any element you transform an explicit size */  #stage { position: relative; width: 100%; height: 100%; }
```

## 3. Opacity animated on an element without a fixed layer

Chromium promotes elements whose opacity or transform is animating to compositor layers depending on seek history. That changes a *neighbour's* edge anti-aliasing: 2 px in frames 62 to 89 of `examples/anime-capture`, with identical DOM values in both orders. Found with Anime.js; the cause is the renderer, so assume it applies to every library.

```css
/* good: pin every element whose opacity is animated */  .dot { will-change: transform, opacity; }
```

## 4. Library defaults that defer or switch

- GSAP: `gsap.defaults({ force3D: false, lazy: false })`. `force3D: "auto"` swaps between 2D and 3D transforms mid-tween; `lazy` defers the first write past the screenshot.
- Anime.js: seek in milliseconds (`tl.seek(t * 1000)`); a seconds value lands on the wrong frame without failing.

## 5. Anything with its own clock

- CSS animations and transitions run on wall time: drive the property from `seek` instead, or pause them and set a negative `animation-delay` from `t`.
- `Math.random()` and `Date.now()`: use a PRNG seeded per frame from `t` and a fixed seed.
- Fonts: expose `window.__scene` only after `document.fonts.ready`, or the first frames lay out with the fallback font.
