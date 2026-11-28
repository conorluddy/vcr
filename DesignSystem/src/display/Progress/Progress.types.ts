import type { HTMLAttributes } from "react";

// === TYPES ===

export interface ProgressProps extends Omit<HTMLAttributes<HTMLDivElement>, "role"> {
  /** Percent complete, 0–100; values outside are clamped. */
  valuePercent: number;
  /** Accessible name, e.g. "Generating round 4". */
  label: string;
}
