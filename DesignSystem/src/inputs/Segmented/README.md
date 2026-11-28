# Segmented

Single-select segmented control; the selected segment is a bone fill with ink text.

```jsx
<Segmented aria-label="View" isGlass options={["SHEET", "INSPECT"]} value={view} onValueChange={setView} />
<Segmented aria-label="Format" size="mobile" isStretched options={["PNG", "JPG", "SVG"]} value={format} onValueChange={setFormat} />
```

- Options are strings or `{ value, label }`. Name the group with `aria-label`; segments announce `aria-pressed`.
- Unselected: `vcr-text-segment-unselected`; hover: `vcr-fill-hover` and bone; selected: `vcr-bone` with `vcr-text-on-bone`.
- `isGlass` for the top bar (glass container, `vcr-line-panel`); otherwise a `vcr-line` hairline box. 40px tall on desktop.
- Never a pill. Toggles are boxes.
