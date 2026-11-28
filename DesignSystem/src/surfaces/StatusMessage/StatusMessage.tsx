import { SignalMark } from "../../display/SignalMark/SignalMark";
import { joinClassNames } from "../../shared/joinClassNames";
import styles from "./StatusMessage.module.css";
import type { StatusMessageProps } from "./StatusMessage.types";

// === PUBLIC API ===

/** Inline status block: a signal mark, a mono code and a sentence. */
export function StatusMessage({
  code,
  markShape = "square",
  className,
  children,
  ...divAttributes
}: StatusMessageProps) {
  return (
    <div className={joinClassNames(styles.statusMessage, className)} {...divAttributes}>
      <span className={styles.mark}>
        <SignalMark shape={markShape} sizePx={markShape === "square" ? 6 : 7} />
      </span>
      <div className={styles.body}>
        <span className={styles.code}>{code}</span>
        <span className={styles.text}>{children}</span>
      </div>
    </div>
  );
}
