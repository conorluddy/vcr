import { joinClassNames } from "../../shared/joinClassNames";
import type { StyleWithVariables } from "../../shared/styleWithVariables.types";
import styles from "./RegionOutline.module.css";
import type { RegionOutlineProps } from "./RegionOutline.types";

// === PUBLIC API ===

/** Two-tone region outline over artwork: a bone stroke inside an ink stroke, so it shows on any colour. */
export function RegionOutline({
  xPx,
  yPx,
  widthPx,
  heightPx,
  label,
  state = "saved",
  className,
  style,
  ...divAttributes
}: RegionOutlineProps) {
  const outlineStyle: StyleWithVariables = {
    ...style,
    "--region-x": `${xPx}px`,
    "--region-y": `${yPx}px`,
    "--region-width": `${widthPx}px`,
    "--region-height": `${heightPx}px`,
  };
  const hasHandle = state === "drawing" || state === "selected";
  return (
    <div
      className={joinClassNames(styles.regionOutline, className)}
      data-state={state}
      style={outlineStyle}
      {...divAttributes}
    >
      {label ? <span className={styles.label}>{label}</span> : null}
      {hasHandle ? <span className={styles.handle} aria-hidden="true" /> : null}
    </div>
  );
}
