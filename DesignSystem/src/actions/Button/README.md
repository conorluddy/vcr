# Button

Mono caps button; one bone-filled primary per surface, named by its outcome.

```jsx
<Button glyph="↗">EXPORT</Button>
<Button variant="secondary">RESET CROP</Button>
<Button variant="glass">COPY STYLE LINK</Button>
<Button variant="text">CANCEL</Button>
<Button size="mobile" isFullWidth glyph="→">GENERATE 20</Button>
```

- `variant`: `primary` (bone fill, `vcr-text-on-bone`, hover `vcr-bone-hover`; 30px, 52px mobile), `secondary` (`vcr-line-strong` hairline, hover bone border; 28px, 48px mobile), `glass` (`vcr-glass-bar` with `vcr-shadow-bar`; 40px, for the top bar), `text` (CANCEL, RESET, KEEP AS IS).
- `glyph` trails the label as a verb (→ ↗ ↓ ↵ ↻) and is hidden from screen readers; with `isFullWidth` it moves to the far edge.
- `isFullHeight` fills a bar, e.g. EXPORT inside the 40px top bar.
- Write `children` in caps; the label is set in `vcr-mono-ui` tracking.
- Accepts every `<button>` attribute; `type` defaults to `"button"`.
- Never put two primaries on one surface. Never shrink on press.
