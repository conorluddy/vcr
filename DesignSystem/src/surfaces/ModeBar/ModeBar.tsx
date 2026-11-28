import { Button } from "../../actions/Button/Button";
import { joinClassNames } from "../../shared/joinClassNames";
import styles from "./ModeBar.module.css";
import type { ModeBarProps } from "./ModeBar.types";

// === PUBLIC API ===

/** 44px glass tool-mode bar: CANCEL · TITLE · DONE. */
export function ModeBar({
  title,
  cancelLabel = "CANCEL",
  doneLabel = "DONE",
  onCancel,
  onDone,
  className,
  ...divAttributes
}: ModeBarProps) {
  return (
    <div className={joinClassNames(styles.modeBar, className)} {...divAttributes}>
      <Button variant="text" onClick={onCancel}>
        {cancelLabel}
      </Button>
      <span className={styles.title}>{title}</span>
      <Button className={styles.done} onClick={onDone}>
        {doneLabel}
      </Button>
    </div>
  );
}
