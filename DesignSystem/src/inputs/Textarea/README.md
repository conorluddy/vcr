# Textarea

Multi-line field that grows with its text, with a mono 000 / 600 counter when it has a `maxLength`.

```jsx
<Textarea label="Brief" maxLength={600} value={brief} onValueChange={setBrief} hint="Saved as you go." />;
```

- Text in sans 13px at `vcr-line-height-prose`; `rows` sets the minimum height and `field-sizing: content` grows it from there.
- The counter is `vcr-text-quiet` and turns bone at the limit. The hint is `vcr-text-tertiary` and describes the field.
- Pass `value` to drive the counter. Accepts every `<textarea>` attribute.
