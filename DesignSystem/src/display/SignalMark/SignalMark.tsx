import { joinClassNames } from "../../shared/joinClassNames";
import type { StyleWithVariables } from "../../shared/styleWithVariables.types";
import styles from "./SignalMark.module.css";
import type { SignalMarkProps } from "./SignalMark.types";

// === PUBLIC API ===

/** Square status mark, or a diamond for marks and faults. Decorative: the adjacent code carries the meaning. */
export function SignalMark({
  shape = "square",
  tone = "bone",
  sizePx,
  className,
  style,
  ...spanAttributes
}: SignalMarkProps) {
  const markStyle: StyleWithVariables = { ...style, "--signal-size": `${sizePx ?? defaultSizePx(shape)}px` };
  return (
    <span
      aria-hidden="true"
      className={joinClassNames(styles.signalMark, className)}
      data-shape={shape}
      data-tone={tone}
      style={markStyle}
      {...spanAttributes}
    />
  );
}

// === PRIVATE HELPERS ===

function defaultSizePx(shape: NonNullable<SignalMarkProps["shape"]>): number {
  return shape === "square" ? 6 : 8;
}
