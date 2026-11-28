import type { HTMLAttributes } from "react";

// === TYPES ===

export interface ModeBarProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** The mode in mono caps, e.g. "MARK" or "CROP". */
  title: string;
  /** Default "CANCEL". */
  cancelLabel?: string | undefined;
  /** Default "DONE". */
  doneLabel?: string | undefined;
  onCancel?: (() => void) | undefined;
  onDone?: (() => void) | undefined;
}
