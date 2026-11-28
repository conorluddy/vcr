# RulerSlider

Ruler slider: hairline rail, 10% ticks, a bone thumb and a tabular value. A native range input does the work.

```jsx
<RulerSlider
  label="Weight"
  value={weight}
  min={0.1}
  max={3}
  step={0.05}
  decimalPlaces={2}
  unit="PX"
  onValueChange={setWeight}
/>;
```

- Provide `label`, `value` and `onValueChange` (it receives a number). `decimalPlaces` sets the shown precision; `unit` follows in `vcr-text-quiet`.
- Desktop: 16px track, 7 × 13 thumb with `vcr-ring-thumb`. Mobile: 36px track, 10 × 24 thumb with `vcr-ring-thumb-mobile`, 6px ticks.
- Keyboard focus draws the focus ring around the thumb.
