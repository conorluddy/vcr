import { joinClassNames } from "../../shared/joinClassNames";
import styles from "./Button.module.css";
import type { ButtonProps } from "./Button.types";

// === PUBLIC API ===

/** Mono caps button; one bone-filled primary per surface. */
export function Button({
  variant = "primary",
  size = "desktop",
  glyph,
  isFullWidth = false,
  isFullHeight = false,
  type = "button",
  className,
  children,
  ...buttonAttributes
}: ButtonProps) {
  return (
    <button
      type={type}
      className={joinClassNames(styles.button, className)}
      data-variant={variant}
      data-size={size}
      data-full-width={isFullWidth || undefined}
      data-full-height={isFullHeight || undefined}
      {...buttonAttributes}
    >
      {children}
      {glyph ? <span aria-hidden="true">{glyph}</span> : null}
    </button>
  );
}
