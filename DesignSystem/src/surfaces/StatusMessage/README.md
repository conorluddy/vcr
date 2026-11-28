# StatusMessage

Inline status block: a signal mark, a mono caps code and one sentence in sans.

```jsx
<StatusMessage code="STATUS · OK">Round 4 saved.</StatusMessage>
<StatusMessage code="E-112 · SAVE FAILED" markShape="diamond-outline">Marks are kept on this device until the next save.</StatusMessage>
```

- Code in `vcr-text-strong` at `vcr-tracking-label`; text in `vcr-text-body` at `vcr-line-height-status`, on `vcr-fill-field` with a `vcr-line-divider` edge.
- Faults use `markShape="diamond-outline"` and an `E-NNN · WHAT FAILED` code. For a fault with actions, use `FaultCard`.
