import type { FieldsetHTMLAttributes } from "react";
import type { ControlSize } from "../../shared/controlSize.types";

// === TYPES ===

export interface SegmentedOption {
  readonly value: string;
  readonly label: string;
}

export interface SegmentedProps extends Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, "onChange"> {
  /** A string is both value and label. */
  options: ReadonlyArray<string | SegmentedOption>;
  value: string;
  onValueChange?: ((value: string) => void) | undefined;
  /** A glass container for the top bar; otherwise a hairline box. */
  isGlass?: boolean | undefined;
  /** Default "desktop"; mobile segments are 36px tall. */
  size?: ControlSize | undefined;
  /** Share the width equally between segments. */
  isStretched?: boolean | undefined;
}
