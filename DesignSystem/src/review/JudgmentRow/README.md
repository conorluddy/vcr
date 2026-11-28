# JudgmentRow

One judgment on a region: category, stars, polarity and the person's optional note. Used in the region popover and tray lists; several rows may share a category on one region.

```jsx
<JudgmentRow category="Typography" rating={5} note="The letterforms" onRatingChange={rate} />
<JudgmentRow category="Colour" rating={1} isActive onClear={clear} />
<JudgmentRow category="Spacing" />
```

- Provide `category`, `rating` and `onRatingChange`; an empty category reads "No category".
- `isActive` marks the row being edited (`vcr-fill-active`) and, once rated, offers CLEAR ×.
- The note sits in curly quotes, `vcr-text-secondary`, aligned under the stars; below 300px wide (a container query) it moves to the row's edge.
- Rows divide with `vcr-line-divider`; put them in a bordered list.
