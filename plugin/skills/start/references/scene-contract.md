# Scene contract

A browser scene talks to VCR through one object, `window.__scene`, and a few optional attributes on its elements. This is the one definition; toolkit guides show how each tool fills it in.

## `window.__scene`

| Field | Required | Read by | Meaning |
| --- | --- | --- | --- |
| `duration` | yes | capture, lint | Seconds. Capture renders frames `0 … round(duration × fps) − 1`, so the duration is exclusive: there is no frame at `t = duration`, and a loop does not repeat its first frame at the seam. |
| `seek(t)` | yes | capture, lint | Puts the scene in its state at `t` seconds. It must be a pure function of `t` (and a fixed seed), giving the same pixels in any seek order. Canvas and WebGL scenes schedule their draw with `requestAnimationFrame` rather than drawing synchronously. See [Determinism pitfalls](determinism.md). |
| `markers` | no | `vcr lint --markers` | An array of times in seconds, or of named markers `{ t, id, role? }`, or a mix. Put one just before each beat ends, when its text has settled and before the next change starts. Lint samples there instead of evenly. A named marker's `id` is the beat ID from the plan (`B03`); `role` is a beat label such as `promise`, `payoff` or `rest`. |
| `textBounds()` | canvas and WebGL text | `vcr lint` | Returns `[{ x, y, width, height, label? }]` in CSS pixels for the current time: one box per piece of visible text. Without it, a canvas scene with no DOM text is reported as *unable to assess*, which is never a pass. |

Set `window.__scene` last, after fonts, images and other assets have loaded (`document.fonts.ready`, then `document.fonts.check()`). Capture waits up to 10 s for `seek` to appear, so nothing loads during the captured frames.

```js
window.__scene = {
  duration: 6,
  seek: (t) => timeline.seek(t),
  markers: [1.9, 3.9, 5.9],
};
```

## Declared fields (settled in #143; no check reads them yet)

Each check implements the fields it needs when it lands. Until then a scene may fill them; nothing fails without them.

| Field | Shape | For |
| --- | --- | --- |
| `regions(t)` | `[{ id, role, x, y, width, height, required?, priority?, anchor? }]` in CSS pixels, rendered geometry (after transforms and clipping) | Adaptation, lighting, brand and motion checks that need a subject, logo, legal line or CTA by name |
| `params` | `{ width, height, fps, seed, aspect?, locale?, dir?, variant? }` | A read-only echo of the version being rendered, so a finding can name the version |
| `data` | `{ source, meta: { source, date, units, transform? }, domain?(t) }` | Data scenes: the data file path, its provenance and the scale domain at `t` |
| `fx` | `{ blendSpace: "srgb-encoded" \| "linear", attach?: { [id]: "frame" \| "object" \| "time" }, boil?: { [id]: stepFrames } }` | `FX-BLEND-SPACE-DECLARED`, `FX-SCREEN-SPACE-DECLARED`, `FX-BOIL-STEPPED`. A series-wide blend space goes in the brief. |

Decisions:

1. **`regions(t)` generalises `textBounds()` and sits beside it.** Text is a region with `role: "text"` (or `key`, `cta`). `textBounds()` stays supported because lint reads it today. A reader takes text regions from `regions(t)` when it exists and falls back to `textBounds()`; a scene implements one or the other, not both. Region boxes use `x, y, width, height` like `textBounds()`, and `role` takes the `data-vcr-role` values below plus `focal`, `subject`, `logo` and `legal`. Mark a region `required` only if losing it is a defect.
2. **Named markers sit beside plain seconds.** `markers` may mix numbers and `{ t, id, role? }`; lint accepts both and samples at `t`. Priorities belong on regions, not markers.
3. **The minimum `params` echo is `width`, `height`, `fps` and `seed`.** The rest is optional and grows with the version record. Same `params`, same frames.
4. **The data block is optional** and only for data scenes. Each mark's datum key is its `data-vcr-id` (or region `id`); rest intervals are named markers with `role: "rest"`.
5. **FX intent is declared in `fx`**, not inferred. A missing declaration is itself the finding those rules report.
6. **`MAT-PHYSICAL-SCOPE` lives in the asset, not the scene:** glTF material `extras.vcr.scope` (`pbr`, `stylised` or `unlit`; default `pbr`). The material checks read `.glb` files without rendering, so the tag travels with the asset.
7. **Not adopted:** `manifest()` (the render manifest from `vcr capture --video` records the source, hashes and environment) and a scene-level `mandatory` list (required regions plus the brief's mandatories cover it). Revisit when an adaptation check needs a time window per mandatory element.

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
- Beat-level labels (`promise`, `payoff`) go on named markers as `role`.
