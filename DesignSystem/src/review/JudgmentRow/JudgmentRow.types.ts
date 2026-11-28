import type { HTMLAttributes } from "react";
import type { Rating } from "../rating.types";
import type { StarRatingDensity } from "../StarRating/StarRating.types";

// === TYPES ===

export interface JudgmentRowProps extends HTMLAttributes<HTMLDivElement> {
  /** e.g. "Typography". Shows "No category" when empty. */
  category?: string | undefined;
  /** Default 0 (unrated). */
  rating?: Rating | undefined;
  /** The person's own qualifying note, shown in curly quotes. */
  note?: string | undefined;
  /** The row being edited: filled, and offers CLEAR × once rated. */
  isActive?: boolean | undefined;
  onRatingChange?: ((rating: Rating) => void) | undefined;
  onClear?: (() => void) | undefined;
  /** Default "popover". */
  density?: StarRatingDensity | undefined;
}
