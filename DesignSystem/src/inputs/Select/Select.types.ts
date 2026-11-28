import type { ButtonHTMLAttributes } from "react";

// === TYPES ===

export interface SelectProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "value" | "onChange" | "children"> {
  /** Names the control for screen readers, e.g. "Canvas size". */
  label: string;
  options: readonly string[];
  /** Must be one of `options`; anything else throws. */
  value: string;
  /** Receives the next option, wrapping after the last. */
  onValueChange?: ((value: string) => void) | undefined;
}
