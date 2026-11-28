import type { HTMLAttributes, ReactNode } from "react";
import type { SignalShape } from "../../display/SignalMark/SignalMark.types";

// === TYPES ===

export interface StatusMessageProps extends HTMLAttributes<HTMLDivElement> {
  /** Mono caps code, e.g. "STATUS · OK" or "E-112 · SAVE FAILED". */
  code: string;
  /** Default "square"; a fault uses "diamond-outline". */
  markShape?: SignalShape | undefined;
  /** What happened, in sentence case. */
  children: ReactNode;
}
