# IconButton

44 × 44 glass control holding one glyph, for tools floating over the artboard.

```jsx
<IconButton glyph="⌖" label="Centre artboard" />
<IconButton glyph="N" label="Next variant" />
<IconButton glyph="◫" label="Split view" isActive />
```

- `label` is required: it is the accessible name, since a glyph is not one.
- `isActive` marks a toggled tool: `vcr-bone` fill, `vcr-text-on-bone` glyph, `aria-pressed`.
- A single capital letter is set in `vcr-mono` at 11px; any other glyph in the surrounding font at 15px.
- Glyphs are Unicode, never emoji. The system has no icon set.
