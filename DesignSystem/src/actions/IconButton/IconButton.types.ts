import type { ButtonHTMLAttributes } from "react";

// === TYPES ===

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** One Unicode glyph (⌖ ◫ ⇕) or a single capital letter, which is set in mono. */
  glyph: string;
  /** Accessible name; the glyph alone is not one. */
  label: string;
  /** A toggled tool: bone fill, ink glyph, announced as pressed. */
  isActive?: boolean | undefined;
}
