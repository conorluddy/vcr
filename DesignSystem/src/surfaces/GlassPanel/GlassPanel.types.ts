import type { HTMLAttributes, ReactNode } from "react";

// === TYPES ===

/** How opaque the glass is: bar .68, panel .78, tip .82, sheet .88. */
export type GlassLevel = "bar" | "panel" | "sheet" | "tip";

export type GlassElevation = "bar" | "card" | "panel" | "none";

export interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  /** Default "panel". */
  level?: GlassLevel | undefined;
  /** Shadow; defaults to "bar" for bars, "panel" for panels and "card" for sheets and tips. */
  elevation?: GlassElevation | undefined;
  children?: ReactNode;
}
