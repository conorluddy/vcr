import type { HTMLAttributes, ReactNode } from "react";
import type { ControlSize } from "../../shared/controlSize.types";

// === TYPES ===

export interface ReadoutProps extends HTMLAttributes<HTMLDivElement> {
  /** Uppercase label, e.g. "SIZE". */
  label: string;
  /** The value, set in tabular mono, e.g. "1080 × 1350 PX". Empty is "—". */
  value: ReactNode;
  /** Default "desktop"; mobile sets the value at 13px. */
  size?: ControlSize | undefined;
}
