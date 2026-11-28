# SearchField

Search pill with a mono caps prefix and a shortcut hint, for the top bar.

```jsx
<SearchField
  label="Find a variant or round"
  prefix="FIND"
  placeholder="Variant, round, mark…"
  shortcutHint="/"
  onValueChange={setQuery}
/>;
```

- `label` is required (the accessible name); `prefix` is decorative.
- Desktop: 40px glass pill, 300px wide by default; mobile: 46px `vcr-fill-field`, `vcr-radius-card`, 16px text, no hint.
- Focus turns the border `vcr-line-focus` at both sizes.
- Accepts every `<input>` attribute; set the width with `className` or `style`.
