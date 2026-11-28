import type { InputHTMLAttributes } from "react";
import type { ControlSize } from "../../shared/controlSize.types";

// === TYPES ===

export interface RulerSliderProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "type" | "value" | "defaultValue" | "onChange" | "size" | "min" | "max" | "step"
  > {
  label: string;
  value: number;
  /** Default 0. */
  min?: number | undefined;
  /** Default 100. */
  max?: number | undefined;
  /** Default 1. */
  step?: number | undefined;
  /** Unit after the value, e.g. "PX". */
  unit?: string | undefined;
  /** Digits after the decimal point in the shown value; default 0. */
  decimalPlaces?: number | undefined;
  onValueChange?: ((value: number) => void) | undefined;
  /** Default "desktop"; mobile has a 36px track and a 10 × 24 thumb. */
  size?: ControlSize | undefined;
}
