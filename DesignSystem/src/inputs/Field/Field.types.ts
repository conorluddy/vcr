import type { InputHTMLAttributes } from "react";

// === TYPES ===

export interface FieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Sentence-case label above the input. */
  label?: string | undefined;
  /** Unit in caps at the label's far end, e.g. "PX". */
  unit?: string | undefined;
  onValueChange?: ((value: string) => void) | undefined;
}
