import type { HTMLAttributes, ReactNode } from "react";

// === TYPES ===

export interface KbdProps extends HTMLAttributes<HTMLElement> {
  /** The key or chord, e.g. "/" or "⌘K". */
  children: ReactNode;
}
