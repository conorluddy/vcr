import type { InputHTMLAttributes } from "react";

// === TYPES ===

export interface CheckboxProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "type" | "checked" | "defaultChecked" | "onChange" | "size"
  > {
  isChecked: boolean;
  onCheckedChange?: ((isChecked: boolean) => void) | undefined;
}
