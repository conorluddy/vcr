import type { FieldsetHTMLAttributes } from "react";
import type { ControlSize } from "../../shared/controlSize.types";

// === TYPES ===

export interface ChoiceGridProps extends Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, "onChange"> {
  options: readonly string[];
  /** The selected option; none selected when it matches no option. */
  value?: string | undefined;
  onValueChange?: ((value: string) => void) | undefined;
  /** Swatch colours aligned with `options` by index. */
  swatchColors?: readonly string[] | undefined;
  /** Default 3. */
  columnCount?: number | undefined;
  /** Default "desktop". */
  size?: ControlSize | undefined;
}
