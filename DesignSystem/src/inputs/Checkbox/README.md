# Checkbox

18 × 18 square checkbox; checked is a `vcr-bone` fill with a `vcr-text-on-bone` ✓.

```jsx
<label>
  <Checkbox isChecked={isIncluded} onCheckedChange={setIsIncluded} /> Include in round
</label>;
```

- A native `<input type="checkbox">`, so keyboard and form behaviour come free. Name it with a wrapping `<label>` or `aria-label`.
- Without `onCheckedChange` it renders read-only.
