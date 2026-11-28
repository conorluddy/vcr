# FaultCard

Coded fault card: ◇ and an `E-NNN · WHAT FAILED` code, a sentence, one primary recovery and up to two alternatives.

```jsx
<FaultCard
  code="E-112 · SAVE FAILED"
  metric="3 OF 20"
  primaryLabel="RETRY SAVE"
  onPrimaryAction={retry}
  secondaryLabels={["DISCARD", "KEEP AS IS"]}
  onSecondaryAction={choose}
>
  Three variants did not save. Marks on them are kept on this device.
</FaultCard>;
```

- Provide `code`, `primaryLabel` and its handler; `onSecondaryAction` receives the chosen label.
- `vcr-glass-sheet` with `vcr-shadow-card` and `vcr-radius-card`; announced with `role="alert"`.
- Defaults to `size="mobile"` (52px primary); use `desktop` inside a tray.
- The body says what failed and what each action does. No apology, no exclamation marks.
