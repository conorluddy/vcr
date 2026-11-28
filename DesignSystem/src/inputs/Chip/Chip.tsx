import { joinClassNames } from "../../shared/joinClassNames";
import styles from "./Chip.module.css";
import type { ChipProps } from "./Chip.types";

// === PUBLIC API ===

/** Quick-value chip, e.g. a variant count. */
export function Chip({ isSelected = false, className, children, ...buttonAttributes }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      className={joinClassNames(styles.chip, className)}
      {...buttonAttributes}
    >
      {children}
    </button>
  );
}
