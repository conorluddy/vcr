import type { ButtonHTMLAttributes } from "react";

// === TYPES ===

export interface SelectProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "value" | "onChange" | "children"> {
  options: readonly string[];
  value: string;
  /** Receives the next option, wrapping after the last. */
  onValueChange?: ((value: string) => void) | undefined;
}
