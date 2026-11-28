import { useId } from "react";
import { joinClassNames } from "../../shared/joinClassNames";
import styles from "./Field.module.css";
import type { FieldProps } from "./Field.types";

// === PUBLIC API ===

/** 30px mono text field with a sans label and a right-aligned unit, which describes the input. */
export function Field({
  label,
  unit,
  id,
  placeholder = "—",
  onChange,
  onValueChange,
  className,
  ...inputAttributes
}: FieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const unitId = `${inputId}-unit`;
  return (
    <div className={joinClassNames(styles.field, className)}>
      {label ? (
        <div className={styles.label}>
          <label htmlFor={inputId}>{label}</label>
          {unit ? (
            <span id={unitId} className={styles.unit}>
              {unit}
            </span>
          ) : null}
        </div>
      ) : null}
      <input
        id={inputId}
        className={styles.input}
        placeholder={placeholder}
        aria-describedby={label && unit ? unitId : undefined}
        onChange={(event) => {
          onChange?.(event);
          onValueChange?.(event.target.value);
        }}
        {...inputAttributes}
      />
    </div>
  );
}
