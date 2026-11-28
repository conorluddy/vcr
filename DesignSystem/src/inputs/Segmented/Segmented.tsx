import { joinClassNames } from "../../shared/joinClassNames";
import styles from "./Segmented.module.css";
import type { SegmentedOption, SegmentedProps } from "./Segmented.types";

// === PUBLIC API ===

/** Single-select segmented control; the selected segment is a bone fill. Name the group with aria-label. */
export function Segmented({
  options,
  value,
  onValueChange,
  isGlass = false,
  size = "desktop",
  isStretched = false,
  className,
  ...divAttributes
}: SegmentedProps) {
  return (
    <fieldset
      className={joinClassNames(styles.segmented, className)}
      data-glass={isGlass || undefined}
      data-size={size}
      data-stretched={isStretched || undefined}
      {...divAttributes}
    >
      {options.map(toOption).map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={option.value === value}
          className={styles.segment}
          onClick={() => onValueChange?.(option.value)}
        >
          {option.label}
        </button>
      ))}
    </fieldset>
  );
}

// === PRIVATE HELPERS ===

function toOption(option: string | SegmentedOption): SegmentedOption {
  return typeof option === "string" ? { value: option, label: option } : option;
}
