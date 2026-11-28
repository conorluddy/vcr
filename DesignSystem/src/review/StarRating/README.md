# StarRating

Five-star judgment control for a region; 0 is unrated and pressing the current star clears it.

```jsx
<StarRating label="Typography" value={rating} onRatingChange={setRating} />
<StarRating value={2} density="list" isReadOnly />
```

- ★ in `vcr-star-on`, ☆ in `vcr-star-off`, gap `vcr-star-gap`. Fill is never colour-coded.
- `density`: `popover` (15px, for rating) or `list` (12px, for showing a saved rating).
- Built on native radios, so arrow keys move between stars. Hovering previews the rating with CSS alone. The group is named "Typography: 4 of 5, Like".
- Always pair with `PolarityTag`, so the meaning is in words as well as fill.
