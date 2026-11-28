import type { Rating } from "../rating.types";
import type { Polarity } from "./PolarityTag.types";

// === PUBLIC API ===

/** Maps a rating to its polarity: ○ unrated, − avoid (1–2), ■ neutral (3), + draw on (4–5). */
export function describePolarity(rating: Rating): Polarity {
  if (rating === 0) {
    return { glyph: "○", text: "UNRATED", use: "CONTEXT" };
  }
  if (rating <= 2) {
    return { glyph: "−", text: String(rating), use: "AVOID" };
  }
  if (rating === 3) {
    return { glyph: "■", text: "3", use: "NEUTRAL" };
  }
  return { glyph: "+", text: String(rating), use: "DRAW ON" };
}
