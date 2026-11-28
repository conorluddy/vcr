import type { HTMLAttributes } from "react";

// === TYPES ===

/** square: OK or live. diamond: a mark. diamond-outline: a fault. */
export type SignalShape = "square" | "diamond" | "diamond-outline";

/** Bone by default; amber and phosphor are the only accents in the system, for 6px status squares. */
export type SignalTone = "bone" | "amber" | "phosphor";

export interface SignalMarkProps extends HTMLAttributes<HTMLSpanElement> {
  /** Default "square". */
  shape?: SignalShape | undefined;
  /** Default "bone". */
  tone?: SignalTone | undefined;
  /** Side in px; defaults to 6 for a square and 8 for a diamond. */
  sizePx?: number | undefined;
}
