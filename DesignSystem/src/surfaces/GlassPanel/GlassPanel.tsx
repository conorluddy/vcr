import { joinClassNames } from "../../shared/joinClassNames";
import styles from "./GlassPanel.module.css";
import type { GlassElevation, GlassLevel, GlassPanelProps } from "./GlassPanel.types";

// === PUBLIC API ===

/** The only surface: frosted glass, a panel hairline, 3px radius and a soft drop shadow. */
export function GlassPanel({
  level = "panel",
  elevation,
  className,
  children,
  ...divAttributes
}: GlassPanelProps) {
  return (
    <div
      className={joinClassNames(styles.glassPanel, className)}
      data-level={level}
      data-elevation={elevation ?? DEFAULT_ELEVATION[level]}
      {...divAttributes}
    >
      {children}
    </div>
  );
}

// === PRIVATE HELPERS ===

const DEFAULT_ELEVATION: Readonly<Record<GlassLevel, GlassElevation>> = {
  bar: "bar",
  panel: "panel",
  sheet: "card",
  tip: "card",
};
