# SignalMark

Square status mark, or a diamond for marks (◆) and faults (◇); decorative, so a code beside it carries the meaning.

```jsx
<SignalMark />
<SignalMark tone="amber" />
<SignalMark shape="diamond-outline" />
```

- `tone` picks `vcr-signal` (bone), `vcr-signal-amber` or `vcr-signal-phosphor`. The accents appear only here, at 6px.
- `diamond-outline` is always a bone outline: it marks a fault in `FaultCard` and `StatusMessage`.
- `sizePx` defaults to 6 for a square and 8 for a diamond.
