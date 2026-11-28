# Select

Cycling select: each press advances to the next option, wrapping, and shows its position (01/03).

```jsx
<Select label="Mode" options={["Auto", "Fixed", "Off"]} value={mode} onValueChange={setMode} />;
```

- For two to five short options. A real dropdown is not designed yet.
- 28px, `vcr-fill-field`, `vcr-line` border (hover `vcr-line-hover`); value in sans 12px bone, position in mono `vcr-text-tertiary`.
- With no options it renders disabled with "—".
