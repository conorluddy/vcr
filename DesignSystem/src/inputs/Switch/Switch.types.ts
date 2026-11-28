import type { ButtonHTMLAttributes } from "react";
import type { ControlSize } from "../../shared/controlSize.types";

// === TYPES ===

export interface SwitchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "children"> {
  /** Accessible name, e.g. "Show marks". */
  label: string;
  isOn: boolean;
  onToggle?: ((isOn: boolean) => void) | undefined;
  /** Default "desktop". */
  size?: ControlSize | undefined;
}
