import type { HTMLAttributes } from "react";

// === TYPES ===

/** saved: solid. selected: solid with a handle. drawing: dashed with a handle, label below. muted: 50%, e.g. not exported. */
export type RegionState = "saved" | "selected" | "drawing" | "muted";

export interface RegionOutlineProps extends HTMLAttributes<HTMLDivElement> {
  /** Position and size in the artboard's own pixels, so the outline stays anchored through zoom. */
  xPx: number;
  yPx: number;
  widthPx: number;
  heightPx: number;
  /** Chip text, e.g. "M-01" or "190 × 130 · DRAWING". */
  label?: string | undefined;
  /** Default "saved". */
  state?: RegionState | undefined;
}
