# Progress

2px determinate progress bar for generation and export.

```jsx
<Progress valuePercent={62} label="Generating round 4" />;
```

- `valuePercent` is clamped to 0–100; the fill is `vcr-bone` on a `vcr-line-divider` track and eases with `vcr-duration-standard`.
- `label` is the accessible name; pair it with a visible mono count such as `07 / 20` when the count matters.
