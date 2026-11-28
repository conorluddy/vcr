import { joinClassNames } from "../../shared/joinClassNames";
import styles from "./GroupHeader.module.css";
import type { GroupHeaderProps } from "./GroupHeader.types";

// === PUBLIC API ===

/** Caps group header with a hairline and a section code. */
export function GroupHeader({ title, code, className, ...divAttributes }: GroupHeaderProps) {
  return (
    <div className={joinClassNames(styles.groupHeader, className)} {...divAttributes}>
      <span className={styles.title}>{title}</span>
      <span className={styles.rule} aria-hidden="true" />
      {code ? <span className={styles.code}>{code}</span> : null}
    </div>
  );
}
