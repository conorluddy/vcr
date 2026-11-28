import { joinClassNames } from "../../shared/joinClassNames";
import styles from "./Switch.module.css";
import type { SwitchProps } from "./Switch.types";

// === PUBLIC API ===

/** Two-cell OFF/ON switch, never a pill toggle. */
export function Switch({
  label,
  isOn,
  onToggle,
  size = "desktop",
  className,
  ...buttonAttributes
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isOn}
      aria-label={label}
      className={joinClassNames(styles.switch, className)}
      data-size={size}
      onClick={() => onToggle?.(!isOn)}
      {...buttonAttributes}
    >
      <span className={styles.offCell} aria-hidden="true">
        OFF
      </span>
      <span className={styles.onCell} aria-hidden="true">
        ON
      </span>
    </button>
  );
}
