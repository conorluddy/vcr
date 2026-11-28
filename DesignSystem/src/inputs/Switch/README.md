# Switch

Two-cell OFF/ON switch, never a pill toggle.

```jsx
<Switch label="Show marks" isOn={isShowingMarks} onToggle={setIsShowingMarks} />;
```

- `label` is the accessible name; the control is `role="switch"` with `aria-checked`.
- On: the ON cell is `vcr-bone` with `vcr-text-on-bone`. Off: the OFF cell is `vcr-fill-off` with `vcr-text-strong`. The inactive cell is `vcr-text-disabled`.
- Mono 8.5px (9.5px mobile) at `vcr-tracking-tag`.
