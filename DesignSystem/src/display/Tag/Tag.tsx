import { joinClassNames } from "../../shared/joinClassNames";
import styles from "./Tag.module.css";
import type { TagProps } from "./Tag.types";

// === PUBLIC API ===

/** Mono caps status tag. */
export function Tag({ variant = "outline", className, children, ...spanAttributes }: TagProps) {
  return (
    <span className={joinClassNames(styles.tag, className)} data-variant={variant} {...spanAttributes}>
      {children}
    </span>
  );
}
