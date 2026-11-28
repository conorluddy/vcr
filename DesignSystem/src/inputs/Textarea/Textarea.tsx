import { useId } from "react";
import { joinClassNames } from "../../shared/joinClassNames";
import type { StyleWithVariables } from "../../shared/styleWithVariables.types";
import styles from "./Textarea.module.css";
import type { TextareaProps } from "./Textarea.types";

// === PUBLIC API ===

/** Multi-line field that grows with its text, with a 000 / 600 counter when it has a maxLength. */
export function Textarea({
  label,
  hint,
  value,
  rows = 5,
  maxLength,
  placeholder = "—",
  onChange,
  onValueChange,
  id,
  className,
  style,
  ...textareaAttributes
}: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const hintId = `${textareaId}-hint`;
  const characterCount = (value ?? "").length;
  const fieldStyle: StyleWithVariables = { ...style, "--textarea-rows": String(rows) };
  return (
    <div className={joinClassNames(styles.textarea, className)}>
      {label ? (
        <label htmlFor={textareaId} className={styles.label}>
          {label}
        </label>
      ) : null}
      <span className={styles.frame}>
        <textarea
          id={textareaId}
          className={styles.input}
          style={fieldStyle}
          value={value ?? ""}
          rows={rows}
          maxLength={maxLength}
          placeholder={placeholder}
          aria-describedby={hint ? hintId : undefined}
          onChange={(event) => {
            onChange?.(event);
            onValueChange?.(event.target.value);
          }}
          {...textareaAttributes}
        />
        {maxLength ? (
          <span
            className={styles.counter}
            data-full={characterCount >= maxLength || undefined}
            aria-hidden="true"
          >
            {String(characterCount).padStart(3, "0")} / {maxLength}
          </span>
        ) : null}
      </span>
      {hint ? (
        <span id={hintId} className={styles.hint}>
          {hint}
        </span>
      ) : null}
    </div>
  );
}
