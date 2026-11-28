import type { FieldsetHTMLAttributes } from "react";
import type { Rating } from "../rating.types";

// === TYPES ===

/** popover: 15px stars for rating. list: 12px stars for showing a saved rating. */
export type StarRatingDensity = "popover" | "list";

export interface StarRatingProps
  extends Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, "onChange" | "disabled"> {
  /** Default 0 (unrated). */
  value?: Rating | undefined;
  /** Receives the chosen star, or 0 when the current star is pressed again. */
  onRatingChange?: ((rating: Rating) => void) | undefined;
  /** Default "popover". */
  density?: StarRatingDensity | undefined;
  /** Accessible name, usually the category. Default "Rating". */
  label?: string | undefined;
  isReadOnly?: boolean | undefined;
}
