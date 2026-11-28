import { joinClassNames } from "../../shared/joinClassNames";
import styles from "./Select.module.css";
import type { SelectProps } from "./Select.types";

// === PUBLIC API ===

/** Cycling select: each press advances to the next option and shows its position, e.g. 01/03. */
export function Select({
  label,
  options,
  value,
  onValueChange,
  className,
  ...buttonAttributes
}: SelectProps) {
  const selectedIndex = findSelectedIndex(options, value);
  const nextOption = options[(selectedIndex + 1) % Math.max(1, options.length)];
  const position = `${padToTwoDigits(selectedIndex + 1)}/${padToTwoDigits(options.length)}`;
  return (
    <button
      {...buttonAttributes}
      type="button"
      className={joinClassNames(styles.select, className)}
      aria-label={
        options.length === 0
          ? `${label}: no options`
          : `${label}: ${value}, ${selectedIndex + 1} of ${options.length}`
      }
      disabled={options.length === 0 || buttonAttributes.disabled}
      onClick={() => {
        if (nextOption !== undefined) {
          onValueChange?.(nextOption);
        }
      }}
    >
      <span>{options[selectedIndex] ?? "—"}</span>
      <span className={styles.position} aria-hidden="true">
        {position}
      </span>
    </button>
  );
}

// === PRIVATE HELPERS ===

function findSelectedIndex(options: readonly string[], value: string): number {
  if (options.length === 0) {
    return 0;
  }
  const index = options.indexOf(value);
  if (index === -1) {
    throw new Error(
      `Select: value "${value}" is not one of the options (${options.join(", ")}). Pass one of them.`,
    );
  }
  return index;
}

function padToTwoDigits(count: number): string {
  return String(count).padStart(2, "0");
}
