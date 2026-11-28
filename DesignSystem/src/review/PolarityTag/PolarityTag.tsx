import { joinClassNames } from "../../shared/joinClassNames";
import { describePolarity } from "./describePolarity";
import styles from "./PolarityTag.module.css";
import type { PolarityTagProps } from "./PolarityTag.types";

// === PUBLIC API ===

/** Mono caps polarity label for a rating: shape and text carry the meaning, never colour. */
export function PolarityTag({
  rating = 0,
  shouldShowUse = true,
  className,
  ...spanAttributes
}: PolarityTagProps) {
  const polarity = describePolarity(rating);
  const useSuffix = shouldShowUse && rating !== 0 ? ` · ${polarity.use}` : "";
  return (
    <span
      className={joinClassNames(styles.polarityTag, className)}
      data-rated={rating !== 0 || undefined}
      {...spanAttributes}
    >
      {`${polarity.glyph} ${polarity.text}${useSuffix}`}
    </span>
  );
}
