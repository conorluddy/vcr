# ModeBar

44px glass tool-mode bar: CANCEL · TITLE · DONE, shown while a mode such as marking or cropping is active.

```jsx
<ModeBar title="MARK" onCancel={leave} onDone={save} />;
```

- `title` in mono caps at `vcr-tracking-heading`; CANCEL is a text button and DONE a 34px primary.
- `vcr-glass-panel` with `vcr-line-panel` and `vcr-radius-card`.
