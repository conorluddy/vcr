import { Button } from "../../actions/Button/Button";
import { SignalMark } from "../../display/SignalMark/SignalMark";
import { joinClassNames } from "../../shared/joinClassNames";
import styles from "./FaultCard.module.css";
import type { FaultCardProps } from "./FaultCard.types";

// === PUBLIC API ===

/** Coded fault card: ◇ and an E-NNN code, a sentence, one primary recovery and up to two alternatives. */
export function FaultCard({
  code,
  metric,
  primaryLabel,
  onPrimaryAction,
  secondaryLabels = [],
  onSecondaryAction,
  size = "mobile",
  className,
  children,
  ...divAttributes
}: FaultCardProps) {
  return (
    <div
      role="alert"
      className={joinClassNames(styles.faultCard, className)}
      data-size={size}
      {...divAttributes}
    >
      <div className={styles.header}>
        <span className={styles.code}>
          <SignalMark shape="diamond-outline" />
          {code}
        </span>
        {metric ? <span className={styles.metric}>{metric}</span> : null}
      </div>
      {children ? <div className={styles.body}>{children}</div> : null}
      <div className={styles.actions}>
        <Button size={size} isFullWidth glyph="→" onClick={onPrimaryAction}>
          {primaryLabel}
        </Button>
        {secondaryLabels.length > 0 ? (
          <div className={styles.secondaryActions}>
            {secondaryLabels.map((label) => (
              <Button
                key={label}
                variant="secondary"
                size={size}
                isFullWidth
                onClick={() => onSecondaryAction?.(label)}
              >
                {label}
              </Button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
