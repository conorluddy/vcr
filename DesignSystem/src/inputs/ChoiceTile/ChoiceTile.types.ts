import type { ButtonHTMLAttributes } from "react";
import type { ControlSize } from "../../shared/controlSize.types";

// === TYPES ===

export interface ChoiceTileProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  label: string;
  isSelected?: boolean | undefined;
  /** A colour this choice stands for, shown as a 10px square before the label. */
  swatchColor?: string | undefined;
  /** Default "desktop"; mobile is 44px tall. */
  size?: ControlSize | undefined;
}
