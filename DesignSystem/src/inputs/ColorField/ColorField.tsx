import { joinClassNames } from "../../shared/joinClassNames";
import type { StyleWithVariables } from "../../shared/styleWithVariables.types";
import styles from "./ColorField.module.css";
import type { ColorFieldProps } from "./ColorField.types";

// === PUBLIC API ===

/** Read-only hex value with a 22 × 14 swatch. A real colour picker is not designed yet. */
export function ColorField({ value, className, ...spanAttributes }: ColorFieldProps) {
  const swatchStyle: StyleWithVariables = { "--swatch-color": value };
  return (
    <span className={joinClassNames(styles.colorField, className)} {...spanAttributes}>
      {value.toUpperCase()}
      <span className={styles.swatch} style={swatchStyle} aria-hidden="true" />
    </span>
  );
}
