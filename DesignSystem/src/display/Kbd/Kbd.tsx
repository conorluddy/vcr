import { joinClassNames } from "../../shared/joinClassNames";
import styles from "./Kbd.module.css";
import type { KbdProps } from "./Kbd.types";

// === PUBLIC API ===

/** Keyboard hint chip. */
export function Kbd({ className, children, ...elementAttributes }: KbdProps) {
  return (
    <kbd className={joinClassNames(styles.kbd, className)} {...elementAttributes}>
      {children}
    </kbd>
  );
}
