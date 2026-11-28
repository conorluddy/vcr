import { joinClassNames } from "../../shared/joinClassNames";
import styles from "./Readout.module.css";
import type { ReadoutProps } from "./Readout.types";

// === PUBLIC API ===

/** Label-over-value readout cell in tabular mono. */
export function Readout({ label, value, size = "desktop", className, ...divAttributes }: ReadoutProps) {
  return (
    <div className={joinClassNames(styles.readout, className)} data-size={size} {...divAttributes}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
    </div>
  );
}
