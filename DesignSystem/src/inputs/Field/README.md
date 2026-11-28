# Field

30px mono text field with a sans label and a right-aligned unit.

```jsx
<Field label="Width" unit="PX" value={width} onValueChange={setWidth} />;
```

- Label in `vcr-font-size-body`, `vcr-text-body`; unit in mono caps, `vcr-text-quiet`, and it describes the input; value in mono `vcr-font-size-value`, bone.
- The empty placeholder is "—". Focus turns the border `vcr-line-focus`.
- Accepts every `<input>` attribute. `onValueChange` receives the string; a plain `onChange` still fires.
- Pair fields in a two-column grid with an 8px gap.
