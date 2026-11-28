# CropThumb

Crop of a marked region: bare (72 × 32, `vcr-line-strong` border) in list rows and popovers, padded on `vcr-artboard-backing` in the Marked details sheet.

```jsx
<CropThumb src={crop.url} alt="" />
<CropThumb label="HEADLINE" isPadded heightPx={74} />
```

- Provide `src` for a saved crop; it covers the frame. Without one, `label` sits on `vcr-placeholder`, or `isHatched` draws the −45° hatch from `vcr-hatch-ink` and `vcr-hatch-light`.
- `alt` defaults to empty, since a row beside the crop usually names the region.
