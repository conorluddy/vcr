import type { HTMLAttributes } from "react";

// === TYPES ===

export interface ColorFieldProps extends HTMLAttributes<HTMLSpanElement> {
  /** A hex colour, shown in caps beside a swatch, e.g. "#a4a8ac". */
  value: string;
}
