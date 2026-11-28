# GlassPanel

The only surface: frosted glass, a `vcr-line-panel` hairline, `vcr-radius-panel` and a soft drop shadow, floating over the flat ground.

```jsx
<GlassPanel level="panel" style={{ padding: 14 }}>
  …
</GlassPanel>;
```

- `level` picks the glass: `bar` (top bar), `panel` (trays, popovers), `tip`, `sheet`. All blur with `vcr-blur-large` and saturate(1.3).
- `elevation` defaults by level (`bar`, `panel`, otherwise `card`); `none` for glass inside glass.
- The consumer provides padding and layout. Nothing docks edge to edge: inset panels 12px from the viewport.
