import { joinClassNames } from "../../shared/joinClassNames";
import type { StyleWithVariables } from "../../shared/styleWithVariables.types";
import styles from "./Progress.module.css";
import type { ProgressProps } from "./Progress.types";

// === PUBLIC API ===

/** 2px determinate progress bar. */
export function Progress({ valuePercent, label, className, style, ...divAttributes }: ProgressProps) {
  const clampedPercent = Math.max(0, Math.min(100, valuePercent));
  const progressStyle: StyleWithVariables = { ...style, "--progress-percent": `${clampedPercent}%` };
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clampedPercent}
      className={joinClassNames(styles.progress, className)}
      style={progressStyle}
      {...divAttributes}
    />
  );
}
