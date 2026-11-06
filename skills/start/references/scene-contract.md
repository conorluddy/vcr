# Scene contract

A browser scene talks to VCR through one object, `window.__scene`, and a few optional attributes on its elements. This is the one definition; toolkit guides show how each tool fills it in.

## `window.__scene`

| Field | Required | Read by | Meaning |
| --- | --- | --- | --- |
| `duration` | yes | capture, lint | Seconds. Capture renders frames `0 … round(duration × fps) − 1`, so the duration is exclusive: there is no frame at `t = duration`, and a loop does not repeat its first frame at the seam. |
| `seek(t)` | yes | capture, lint | Puts the scene in its state at `t` seconds. It must be a pure function of `t` (and a fixed seed), giving the same pixels in any seek order. Canvas and WebGL scenes schedule their draw with `requestAnimationFrame` rather than drawing synchronously. See [Determinism pitfalls](determinism.md). |
| `markers` | no | `vcr lint --markers` | An array of times in seconds. Put one just before each beat ends, when its text has settled and before the next change starts. Lint samples there instead of evenly. |
| `textBounds()` | canvas and WebGL text | `vcr lint` | Returns `[{ x, y, width, height, label? }]` in CSS pixels for the current time: one box per piece of visible text. Without it, a canvas scene with no DOM text is reported as *unable to assess*, which is never a pass. |

Set `window.__scene` last, after fonts, images and other assets have loaded (`document.fonts.ready`, then `document.fonts.check()`). Capture waits up to 10 s for `seek` to appear, so nothing loads during the captured frames.

```js
window.__scene = {
  duration: 6,
  seek: (t) => timeline.seek(t),
  markers: [1.9, 3.9, 5.9],
};
```

## Reserved for upcoming checks

No check reads these yet. The art, motion and pacing references plan checks that will read them (see `references/README.md` in the harness). Use these names, rather than inventing others, when a scene already needs to label its elements.

- `data-vcr-id="<stable id>"` on an element whose identity must survive across scenes or re-renders, such as a shared element in a transition.
- `data-vcr-role` with one or more space-separated values:
  - `primary`: the lead mover of its beat;
  - `shared`: carried across a transition;
  - `impact`: a hit or contact;
  - `loop`: part of a loop deliverable;
  - `text`: text to be read;
  - `key`: text that must be read twice (headline, claim, CTA);
  - `cta`: the call to action;
  - `hold`: an intentional static moment;
  - `montage`: a deliberately busy passage.
- Beat-level labels (`promise`, `payoff`) become named markers when a check needs them. Until then, `markers` stays a plain array of seconds.
