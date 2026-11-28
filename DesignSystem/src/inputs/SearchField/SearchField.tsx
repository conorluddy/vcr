import { Kbd } from "../../display/Kbd/Kbd";
import { joinClassNames } from "../../shared/joinClassNames";
import styles from "./SearchField.module.css";
import type { SearchFieldProps } from "./SearchField.types";

// === PUBLIC API ===

/** Search pill with a mono prefix and a shortcut hint. */
export function SearchField({
  label,
  prefix,
  shortcutHint,
  onChange,
  onValueChange,
  size = "desktop",
  className,
  ...inputAttributes
}: SearchFieldProps) {
  const isShortcutShown = Boolean(shortcutHint) && size === "desktop";
  return (
    <label className={joinClassNames(styles.searchField, className)} data-size={size}>
      <span className={styles.prefix} aria-hidden="true">
        {prefix}
      </span>
      <input
        type="search"
        aria-label={label}
        className={styles.input}
        onChange={(event) => {
          onChange?.(event);
          onValueChange?.(event.target.value);
        }}
        {...inputAttributes}
      />
      {isShortcutShown ? <Kbd>{shortcutHint}</Kbd> : null}
    </label>
  );
}
