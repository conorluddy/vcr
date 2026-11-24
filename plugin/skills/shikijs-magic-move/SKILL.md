---
name: shikijs-magic-move
description: Animate one code snippet into another with @shikijs/magic-move (token-aware moves, fades) and capture it frame by frame in VCR by pausing and seeking its CSS transitions. Use once animated code diffs have been chosen; for a static code still use freeze.
---

# @shikijs/magic-move

Shiki-highlighted code states joined by keyed-token transitions. Evidence: `@shikijs/magic-move` 4.6.0 with `shiki` 4.6.0, Chromium 156.0.8078.4 via Playwright 1.64.1, Node 22.19.0, macOS arm64 (`examples/shiki-magic-move-capture`, 2026-11-24). Anything beyond that fixture is marked untested.

The maintained package is `@shikijs/magic-move`. The old `shiki-magic-move` repository is archived (a re-export since v4.2.0); the fixture does not use the archived 1.4.0 npm package.

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Proven: the DOM renderer (`MagicMoveRenderer`), one two-step TypeScript snippet pair, `github-dark`, JetBrains Mono Bold, Shiki tokens computed in Node, alpha PNG frames at 1280x720.
- Endpoints equal the library's own static render of each snippet (same DOM and CSS path, not raw `codeToHtml` markup); a middle frame is a real intermediate state; shuffled capture equals sequential.
- Untested: Vue, React, Svelte, Solid and web-component wrappers, other themes or languages, more than two steps, other browsers, GPU paths, encoding, alpha after encoding.
- Not a seekable animation: the transition is CSS and runs on the browser clock unless you freeze it (below). For general kinetic text or tweens use `anime-js`; for a still code image use `freeze`.
- Typography of the code (face, size, hold before and after the move) follows the typography pillar: TYPO-FONTS, TYPO-FONT-READY, TYPO-HOLD. Timing and easing follow the motion pillar: MOTION-TIME-001, MOTION-EASE-001. Read them with `vcr rules info <ID>`; this guide sets no thresholds.

## Capability map
- **Core, framework-free** (`@shikijs/magic-move/core`) — `codeToKeyedTokens`, `createMagicMoveMachine` (commit snippets, get `previous` and `current` keyed token sets). Tested: the machine with a Shiki highlighter.
- **DOM renderer** (`@shikijs/magic-move/renderer`) — `MagicMoveRenderer(container, options)` with `render()` and `replace()`; options include `duration`, `easing`, `containerStyle`. Tested: `render`, `duration`, `easing`, `containerStyle: false`.
- **Wrappers** — Vue, React, Svelte, Solid, web component; precompiled-token path. Discoverable only, untested.
- Index: https://shiki.style/packages/magic-move. Shiki itself (themes, languages): https://shiki.style.

## Install and doctor
`pnpm add @shikijs/magic-move@4.6.0 shiki@4.6.0` (record `install.check_command`: `pnpm list @shikijs/magic-move shiki --depth 0`). Capture needs Playwright's Chromium: `vcr setup capture --yes`, then `vcr doctor`. Both packages must stay in step with the peer range.

## Smoke test
```text
examples/shiki-magic-move-capture/run.sh
# expect: shiki-magic-move-capture: OK (90 frames, 61 distinct)
```
`run.sh` also diffs checks and frame 45's alpha range (min 0, max 1) against `expected/summary.json`. The distinct-hash count is the one sampled number; it varies with timeline and options.

## Scene contract
Highlight in Node, hand the keyed tokens to the page, and rebuild everything from `t` on each seek:
```js
// Node: tokens for both states
const machine = createMagicMoveMachine((code, lineNumbers) => codeToKeyedTokens(highlighter, code, { lang, theme }, lineNumbers));
machine.commit(snippetA);
const { previous, current } = machine.commit(snippetB);   // write as steps.json
```
```js
// Page: seek(t) is a pure function of t
const OPTIONS = { duration: 2000, easing: "ease-in-out", containerStyle: false };
function seek(seconds) {
  container.replaceChildren(); container.removeAttribute("style");
  container.className = "shiki-magic-move-container";
  const renderer = new MagicMoveRenderer(container, OPTIONS);
  renderer.render(steps.from); renderer.render(steps.to);       // starts the CSS transitions
  const animations = container.getAnimations({ subtree: true });
  const endMs = Math.max(0, ...animations.map((a) => a.effect.getComputedTiming().endTime));
  for (const a of animations) { a.pause(); a.currentTime = Math.min(seconds * 1000, endMs); }
}
window.__scene = { duration: 3, seek };
```
- Freeze via the seek route: never let the transition run on the browser clock. Rebuild, pause, set `currentTime`; the scene needs no timers or `requestAnimationFrame` state, which is why shuffled equals sequential.
- Import the stylesheet `@shikijs/magic-move/dist/style.css` and set `containerStyle: false` to keep the background transparent; load the font with `document.fonts.load` before the first seek (TYPO-FONT-READY).
- Frames come from the shared `@vcr/capture` harness: seek, settle two animation frames, screenshot.
- Needs the library to stay CSS-based; a renderer change needs a rerun.

## Size the timeline to the transition
The transition settles by roughly the `duration` option, plus a container-width transition that ran about 40 percent longer in the `duration: 800` run (width ended at 1120 ms, moves at 800 ms). Run 1 used `duration: 800` in a 2.0 s scene; the transition was already settled at t = 1.0 s, so the middle frame equalled the end state. The fix was `duration: 2000` in a 3.0 s scene, with the middle frame at 1.5 s.
- Set the scene duration from the library `duration` option (plus the hold you want after it, TYPO-HOLD), not from a nominal scene length. Read `endMs` from `getComputedTiming().endTime` as above to confirm.
- Choose the option and easing against the motion pillar (MOTION-TIME-001, MOTION-EASE-001); the fixture shows only that 2000 ms with `ease-in-out` is capturable.
- Sample a mid-transition frame in every new scene; a frame past `endMs` is simply the end state.

## Troubleshooting
- Middle frame equals an endpoint: the timeline is longer than the transition. Shorten the scene or lengthen `duration` (see above); this failed the first run.
- Leaving and entering tokens overlap mid-move: the library cross-fades matched and unmatched tokens at once, so glyphs collide in frames 15 to 30 of the fixture. That is its look, not a capture fault.
- Frame 0 differs from a static still: compare against the library's own static path (`MagicMoveRenderer.replace()` with the same DOM), not raw `codeToHtml` output, which is a different DOM.
- Mismatch between shuffled and sequential: a scene is carrying state across seeks; rebuild the container each time.

## Official docs
- Magic Move: https://shiki.style/packages/magic-move
- Package source: https://github.com/shikijs/shiki/tree/main/packages/magic-move
- Shiki: https://shiki.style
- Animation.currentTime: https://developer.mozilla.org/en-US/docs/Web/API/Animation/currentTime
- Element.getAnimations(): https://developer.mozilla.org/en-US/docs/Web/API/Element/getAnimations
