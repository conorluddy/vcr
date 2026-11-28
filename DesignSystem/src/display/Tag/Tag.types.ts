import type { HTMLAttributes, ReactNode } from "react";

// === TYPES ===

/** outline: a final state or REFERENCE. muted: DRAFT. solid: FIXED, A/B labels and file types. */
export type TagVariant = "outline" | "muted" | "solid";

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  /** Default "outline". */
  variant?: TagVariant | undefined;
  /** Uppercase mono text, e.g. "FIXED" or "PNG". */
  children: ReactNode;
}
