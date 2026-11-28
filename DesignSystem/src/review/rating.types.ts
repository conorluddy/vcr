// === TYPES ===

/** A judgment: 0 is unrated, 1–2 avoid, 3 neutral, 4–5 draw on. */
export type Rating = 0 | 1 | 2 | 3 | 4 | 5;

export const RATING_MEANINGS: Readonly<Record<Rating, string>> = {
  0: "Unrated",
  1: "Strongest dislike",
  2: "Dislike",
  3: "Neutral",
  4: "Like",
  5: "Strongest preference",
};
