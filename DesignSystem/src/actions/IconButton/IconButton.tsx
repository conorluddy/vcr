import { joinClassNames } from "../../shared/joinClassNames";
import styles from "./IconButton.module.css";
import type { IconButtonProps } from "./IconButton.types";

// === PUBLIC API ===

/** 44 × 44 glass control holding one glyph. */
export function IconButton({ glyph, label, isActive, className, ...buttonAttributes }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={isActive}
      className={joinClassNames(styles.iconButton, className)}
      data-glyph-kind={isSingleCapital(glyph) ? "letter" : "symbol"}
      {...buttonAttributes}
    >
      {glyph}
    </button>
  );
}

// === PRIVATE HELPERS ===

function isSingleCapital(glyph: string): boolean {
  return /^[A-Z]$/.test(glyph);
}
