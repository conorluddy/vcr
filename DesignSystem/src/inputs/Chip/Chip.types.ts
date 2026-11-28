import type { ButtonHTMLAttributes, ReactNode } from "react";

// === TYPES ===

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isSelected?: boolean | undefined;
  /** The value in mono, e.g. "20". */
  children: ReactNode;
}
