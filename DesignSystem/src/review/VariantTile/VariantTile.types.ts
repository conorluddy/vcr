import type { HTMLAttributes } from "react";

// === TYPES ===

/** done: a design to open. pending: still generating. failed: generation failed, retry offered. */
export type VariantState = "done" | "pending" | "failed";

export interface VariantTileProps extends HTMLAttributes<HTMLDivElement> {
  /** Stable variant ID, e.g. "V-07". */
  variantId: string;
  /** Default "done". */
  state?: VariantState | undefined;
  /** The design, shown whole, never cropped. */
  src?: string | undefined;
  /** CSS aspect-ratio of the canvas; default "4 / 5". */
  aspectRatio?: string | undefined;
  /** Number of marked regions; hidden when 0. */
  markCount?: number | undefined;
  /** Keyboard focus or last opened. */
  isSelected?: boolean | undefined;
  onOpen?: (() => void) | undefined;
  onRetry?: (() => void) | undefined;
}
