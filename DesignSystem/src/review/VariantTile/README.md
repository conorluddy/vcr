# VariantTile

One design in a round's contact sheet: the whole design on `vcr-artboard-backing`, its stable ID and its mark count.

```jsx
<VariantTile variantId="V-07" src={url} markCount={2} isSelected onOpen={open} />
<VariantTile variantId="V-16" state="pending" />
<VariantTile variantId="V-11" state="failed" onRetry={retry} />
```

- Lay tiles out in a CSS grid with 12px gaps. `aspectRatio` is the canvas ratio (default "4 / 5"); every state keeps the same footprint.
- Never crop the design: it is shown whole (`object-fit: contain`) and the backing absorbs any ratio.
- `done` frames are buttons named "Open V-07". `pending` is a dashed frame; `failed` is the hatch with ◇ FAILED and RETRY ↻.
- `isSelected` draws a bone outline: keyboard focus or the last opened tile.
