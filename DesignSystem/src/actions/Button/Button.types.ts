import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { ControlSize } from "../../shared/controlSize.types";

// === TYPES ===

/** primary: bone fill, one per task. secondary: hairline. glass: top-bar action. text: CANCEL, RESET, KEEP AS IS. */
export type ButtonVariant = "primary" | "secondary" | "glass" | "text";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Default "primary". */
  variant?: ButtonVariant | undefined;
  /** Default "desktop". Mobile raises primary to 52px and secondary to 48px. */
  size?: ControlSize | undefined;
  /** Trailing glyph used as a verb: → go, ↗ open, ↓ download, ↵ confirm, ↻ retry. Hidden from screen readers. */
  glyph?: string | undefined;
  /** Fill the container's width; a trailing glyph moves to the far edge. */
  isFullWidth?: boolean | undefined;
  /** Fill the container's height, e.g. inside the 40px top bar. */
  isFullHeight?: boolean | undefined;
  /** Uppercase mono label named by its outcome, e.g. "GENERATE 20". */
  children?: ReactNode;
}
