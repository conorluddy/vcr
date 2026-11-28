Monochrome HUD system for a one-person browser studio that explores many static-graphic treatments of one brief: contact sheets of variants, region marks with independent star judgments, branching rounds, PNG export. Floating frosted-glass panels over a flat ground, hairline borders, small tight type, tracked mono caps. The interface stays grey so the artwork is the only colour on screen.

The surface is the desktop studio: Home → Brief → Contact sheet → Inspect and mark → Marked details → New round → Export. Phone bottom-sheet layouts are specified but not designed yet; the `mobile` sizes and type styles exist for them.

## Content fundamentals

- **Voice:** terse, instrument-like, declarative. No marketing, no exclamation marks, no emoji. Hints describe behaviour: "Saved as you go. Not sent to a round until selected." "Reference imagery guides the look. A fixed asset appears in every design unaltered."
- **Two registers.** Set what a person reads in `vcr-sans`, sentence case: labels, notes, hints, titles ("Round history"). Set what the machine prints in `vcr-mono`, uppercase: V-07, R4 · HISTORY, 1080 × 1350 PX, GENERATE 20 →, ◇ FAILED.
- **Person:** impersonal; the occasional imperative ("Click an element or drag a rectangle."). The person's own notes appear in curly quotes.
- **Separators:** a middle dot ` · ` joins facts (M-01 · V-07 · R1); a slash gives position (07 / 20); arrows are verbs: → go, ↗ open source, ↓ download, ↵ confirm, ↻ retry, ↶ undo.
- **IDs:** rounds `R1`, variants `V-07`, regions `M-01`, faults `E-112 · SAVE FAILED`. Zero-pad counts (04 OF 05). Units in caps (PX). An empty value is "—".
- **Polarity:** ○ UNRATED · − AVOID · ■ NEUTRAL · + DRAW ON. Fixed inputs are tagged FIXED (solid `Tag`), reference imagery REFERENCE (outline `Tag`).
- **One primary per task**, named by its outcome: "Generate 20", "New round with 4", "Download PNG".

## Visual foundations

- **Colour is monochrome.** The `vcr-ink-0`…`vcr-ink-9` ramp runs #0b0c0d → #d9dad7; `vcr-bone` (#f2f2f0) is the one emphasis colour for primary text, primary fill, focus and selection, and `vcr-bone-hover` (#fff) only ever appears as a hover on bone. Colour belongs to the artwork. `vcr-signal-amber` and `vcr-signal-phosphor` appear only on 6px status squares (`SignalMark`).
- **Read semantic tokens, never the ramp:** `vcr-text-*` for text, `vcr-line-*` for borders, `vcr-fill-*` for fills, `vcr-glass-*` for surfaces. The ramp exists to define them.
- **Text grounds.** Every `vcr-text-*` token from primary to quiet holds 4.5:1 on `vcr-ground` and on glass in both themes; `vcr-text-disabled` is for disabled controls only. Text on a bone fill is `vcr-text-on-bone`, never a literal colour.
- **Themes.** Dark is canonical. Light (`data-theme="light"`) is provisional: roles invert and bone becomes ink.
- **Type.** `vcr-sans` is Schibsted Grotesk 400/500; `vcr-mono` is Fragment Mono 400. Body 12px, hints 11px, mono labels 9px, titles 22px at −0.01em. Titles are specified at 300; Schibsted Grotesk has no 300, so they render at 400. Fragment Mono has only 400, so mono emphasis comes from colour and tracking, never weight. Mono caps are always tracked (`vcr-tracking-coordinate` 0.06em for IDs up to `vcr-tracking-heading` 0.16em for headers); sans is never tracked. Components read sizes from the `vcr-font-size-*` scale; the type styles are built from the same values.
- **Surfaces are glass only:** `vcr-glass-bar` .68, `vcr-glass-panel` .78, `vcr-glass-tip` .82, `vcr-glass-sheet` .88, each with `blur(var(--vcr-blur-large)) saturate(1.3)`, a 1px `vcr-line-panel` edge, `vcr-radius-panel` and, for anything floating, `vcr-shadow-panel` or `vcr-shadow-card`. No gradients, no inner shadows. Use `GlassPanel`.
- **Ground.** Flat `vcr-ground`; no imagery behind the UI. Artboards, tiles and crops sit on the opaque `vcr-artboard-backing` so transparent or pale artwork reads.
- **Placeholders.** `vcr-placeholder` for artwork not supplied; the −45° hatch (`vcr-hatch-ink` over `vcr-hatch-light`) for imagery and failures; a 1px dashed outline for pending.
- **Region outline.** A 1px `vcr-outline-light` stroke inside a 1px `vcr-outline-dark` stroke, theme-independent, so it shows on any artwork. Solid is saved, dashed with the 8px handle is drawing, and the label chip sits above (ink) or below (bone).
- **Ratings** are ★/☆ glyphs in `vcr-star-on` and `vcr-star-off`, and their meaning is restated by `PolarityTag`. Never colour-code them.
- **Borders** are 1px hairlines: `vcr-line-subtle` .06, `vcr-line` .10, `vcr-line-strong` .16, `vcr-line-hover` .26. Selection is a bone border or a bone fill. Hairlines sit below 3:1 by intent, so state is never carried by a border alone: selected controls also change fill or text.
- **Focus** is a 1px solid `vcr-line-focus` (bone) outline, 2px out; fields turn their border bone instead.
- **Radii:** `vcr-radius-inner` 1px, `vcr-radius-control` 2px, `vcr-radius-panel` 3px, `vcr-radius-card` 4px for fault cards and the mode bar. No pills; toggles are two-cell boxes (`Switch`, `Segmented`).
- **Layout.** 12px is the unit (`vcr-space-6`). The top bar is 40px (`vcr-height-bar`), inset 12px; trays are `vcr-tray-width` (312px); the region popover is `vcr-popover-width` (372px). Everything floats; nothing docks edge to edge. An artboard keeps `vcr-artboard-padding` (28px) on every side.
- **Motion.** `vcr-easing-standard` for everything; `vcr-duration-fast` 120ms for hover, `vcr-duration-standard` 200ms for state, `vcr-duration-sheet` 320ms for sheets. Fades and slides only. Reduced motion is respected.
- **Hover, press, focus.** Text goes to primary, a border goes to `vcr-line-hover` or bone, a fill goes to `vcr-fill-hover`; a primary goes from bone to `vcr-bone-hover`. Nothing shrinks on press.
- **Blur and transparency** only on glass and scrims (`vcr-scrim`, `vcr-crop-surround`).

## Iconography

No icon font or SVG set. Use Unicode glyphs in the surrounding font: ◆ mark, ◇ fault, ★ ☆ rating, ○ − ■ + polarity, ⇕ reorder, ← → ↗ ↓ ↵ ↻ ↶ ‹ › ▾ ✓ ×. No emoji. There is no logo: set the product name in plain type at `vcr-tracking-brand`. Glyph rendering varies by OS; a drawn 16px set is an open question.

## Using the components

- Load `tokens.css`, `components/bundle.css`, React 18 and `components/bundle.js`, in that order; the components are on `window.VCRStudio`. On a Design canvas, link `tokens.css` and `components/bundle.css`, then `components/bundle.js`; the canvas supplies React 18. Fonts are Google-hosted: add a `fonts.googleapis.com/css2` link for Schibsted Grotesk 400;500 and Fragment Mono.
- `bundle.css` declares `@layer vcr.reset, vcr.components`. Your own unlayered CSS overrides any component without `!important`; pass `className` or `style` to the root element.
- Components expose state as attributes, not classes: `data-variant`, `data-size`, `aria-pressed`, `aria-checked`. Style off those when you extend one.
- `size="mobile"` raises touch targets to 44px or more; desktop is the default.
- Inputs report plain values: `onValueChange(value)`, `onCheckedChange(isChecked)`, `onToggle(isOn)`, `onRatingChange(rating)`.

## Not designed yet

Top bar, region popover shell, selection tray, round-history tree, comparison view, phone bottom sheet, a real dropdown (`Select` cycles for now), toasts, a colour picker (`ColorField` only displays), and the final light theme.

## Editing

This system is built from `DesignSystem/` in the `conorluddy/vcr` repository. Change tokens and components there; edits made on this page are replaced by the next publish.
