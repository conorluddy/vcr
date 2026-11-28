# RegionOutline

Two-tone region outline over artwork: a `vcr-outline-light` stroke inside a `vcr-outline-dark` stroke, so it shows on light and dark artwork alike.

```jsx
<div style={{ position: "relative" }}>
  <img src={variant.src} alt="" />
  <RegionOutline xPx={30} yPx={34} widthPx={312} heightPx={132} label="M-01" />
  <RegionOutline
    xPx={120}
    yPx={250}
    widthPx={190}
    heightPx={130}
    label="190 × 130 · DRAWING"
    state="drawing"
  />
</div>;
```

- The container provides `position: relative`; coordinates are in the artboard's own pixels.
- States: `saved` (solid), `selected` (solid with an 8px handle), `drawing` (dashed with a handle, label chip below), `muted` (`vcr-opacity-muted`).
- Never theme these colours.
