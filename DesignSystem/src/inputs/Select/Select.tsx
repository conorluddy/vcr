import { joinClassNames } from "../../shared/joinClassNames";
import styles from "./Select.module.css";
import type { SelectProps } from "./Select.types";

// === PUBLIC API ===

/** Cycling select: each press advances to the next option and shows its position, e.g. 01/03. */
export function Select({ options, value, onValueChange, className, ...buttonAttributes }: SelectProps) {
  const selectedIndex = Math.max(0, options.indexOf(value));
  const nextOption = options[(selectedIndex + 1) % Math.max(1, options.length)];
  return (
    <button
      type="button"
      className={joinClassNames(styles.select, className)}
      disabled={options.length === 0}
      onClick={() => {
        if (nextOption !== undefined) {
          onValueChange?.(nextOption);
        }
      }}
      {...buttonAttributes}
    >
      <span>{options[selectedIndex] ?? "—"}</span>
      <span className={styles.position}>
        {padToTwoDigits(selectedIndex + 1)}/{padToTwoDigits(options.length)}
      </span>
    </button>
  );
}

// === PRIVATE HELPERS ===

function padToTwoDigits(count: number): string {
  return String(count).padStart(2, "0");
}
