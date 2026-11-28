import type { TextareaHTMLAttributes } from "react";

// === TYPES ===

export interface TextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "defaultValue"> {
  label?: string | undefined;
  /** Behaviour note under the field, e.g. "Saved as you go." */
  hint?: string | undefined;
  value?: string | undefined;
  onValueChange?: ((value: string) => void) | undefined;
}
