# PolarityTag

Mono caps polarity label for a rating; shape and text carry the meaning, never colour.

```jsx
<PolarityTag rating={5} />   // + 5 · DRAW ON
<PolarityTag rating={2} />   // − 2 · AVOID
<PolarityTag rating={0} />   // ○ UNRATED
```

- ○ unrated, − avoid (1–2), ■ neutral (3), + draw on (4–5). `describePolarity(rating)` returns the same mapping as data.
- `shouldShowUse={false}` drops the "· DRAW ON" suffix where space is tight.
- Rated: `vcr-text-secondary`; unrated: `vcr-text-quiet`. Pair it with every `StarRating`.
