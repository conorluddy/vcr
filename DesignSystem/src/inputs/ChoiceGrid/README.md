# ChoiceGrid

Single-choice grid of `ChoiceTile`s, three columns by default, for picking one of a few named options.

```jsx
<ChoiceGrid
  aria-label="Aspect"
  options={["Square", "Portrait", "Landscape"]}
  value={aspect}
  onValueChange={setAspect}
/>;
```

- Provide `options`, the selected `value` and `onValueChange`; name the group with `aria-label`.
- `swatchColors` lines up with `options` by index. `columnCount` changes the columns; gaps are `vcr-space-2` (desktop) and `vcr-space-3` (mobile).
