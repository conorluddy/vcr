import type { HTMLAttributes, ReactNode } from "react";
import type { ControlSize } from "../../shared/controlSize.types";

// === TYPES ===

export interface FaultCardProps extends HTMLAttributes<HTMLDivElement> {
  /** e.g. "E-112 · SAVE FAILED". */
  code: string;
  /** A measured fact at the header's far end, e.g. "3 OF 20". */
  metric?: string | undefined;
  /** The one recovery, named by its outcome, e.g. "RETRY SAVE". */
  primaryLabel: string;
  onPrimaryAction?: (() => void) | undefined;
  /** Up to two alternatives, e.g. ["DISCARD", "KEEP AS IS"]. */
  secondaryLabels?: readonly string[] | undefined;
  onSecondaryAction?: ((label: string) => void) | undefined;
  /** Default "mobile". */
  size?: ControlSize | undefined;
  /** What went wrong and what the actions do, in sentence case. */
  children?: ReactNode;
}
