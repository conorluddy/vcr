import type { HTMLAttributes } from "react";

// === TYPES ===

export interface GroupHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** Group name, set in uppercase mono. */
  title: string;
  /** Section code at the far end, e.g. "CONT.02". */
  code?: string | undefined;
}
