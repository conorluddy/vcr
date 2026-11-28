import type { HTMLAttributes } from "react";
import type { Rating } from "../rating.types";

// === TYPES ===

export type PolarityGlyph = "○" | "−" | "■" | "+";
export type PolarityUse = "CONTEXT" | "AVOID" | "NEUTRAL" | "DRAW ON";

/** What a rating means for the next round, carried by glyph and text, never colour. */
export interface Polarity {
  readonly glyph: PolarityGlyph;
  /** "UNRATED" or the rating digit. */
  readonly text: string;
  readonly use: PolarityUse;
}

export interface PolarityTagProps extends HTMLAttributes<HTMLSpanElement> {
  /** Default 0 (unrated). */
  rating?: Rating | undefined;
  /** Append the use, e.g. "· DRAW ON". Default true. */
  shouldShowUse?: boolean | undefined;
}
