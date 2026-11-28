import { joinClassNames } from "../../shared/joinClassNames";
import styles from "./Checkbox.module.css";
import type { CheckboxProps } from "./Checkbox.types";

// === PUBLIC API ===

/** 18 × 18 square checkbox; checked is a bone fill with an ink ✓. Name it with a wrapping label or aria-label. */
export function Checkbox({ isChecked, onCheckedChange, className, ...inputAttributes }: CheckboxProps) {
  return (
    <input
      type="checkbox"
      checked={isChecked}
      readOnly={!onCheckedChange}
      onChange={(event) => onCheckedChange?.(event.target.checked)}
      className={joinClassNames(styles.checkbox, className)}
      {...inputAttributes}
    />
  );
}
