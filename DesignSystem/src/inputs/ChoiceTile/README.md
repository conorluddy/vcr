# ChoiceTile

One selectable option tile; group several with `ChoiceGrid`.

```jsx
<ChoiceTile label="Portrait" isSelected />
<ChoiceTile label="Warm" swatchColor="#c8703a" />
```

- Unselected: `vcr-line` border, `vcr-text-secondary`; hover lifts the border to `vcr-line-hover` and the text to bone. Selected: bone border on `vcr-fill-selected`, `aria-pressed`.
- `swatchColor` is data (a colour the option stands for), shown as a 10px square (12px mobile) the screen reader skips.
- 32px tall on desktop, 44px on mobile.
