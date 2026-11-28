import type { InputHTMLAttributes } from "react";
import type { ControlSize } from "../../shared/controlSize.types";

// === TYPES ===

export interface SearchFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size" | "prefix"> {
  /** Accessible name; the prefix is too short to be one. */
  label: string;
  /** Mono caps prefix, e.g. "FIND". */
  prefix: string;
  /** Shortcut hint on desktop, e.g. "/". */
  shortcutHint?: string | undefined;
  onValueChange?: ((value: string) => void) | undefined;
  /** Default "desktop": a glass pill. Mobile: a 46px filled field with 16px text and no hint. */
  size?: ControlSize | undefined;
}
