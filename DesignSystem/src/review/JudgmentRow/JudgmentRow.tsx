import { joinClassNames } from "../../shared/joinClassNames";
import { PolarityTag } from "../PolarityTag/PolarityTag";
import { StarRating } from "../StarRating/StarRating";
import styles from "./JudgmentRow.module.css";
import type { JudgmentRowProps } from "./JudgmentRow.types";

// === PUBLIC API ===

/** One judgment on a region: category, stars, polarity and an optional note. Several rows may share a category. */
export function JudgmentRow({
  category,
  rating = 0,
  note,
  isActive = false,
  onRatingChange,
  onClear,
  density = "popover",
  className,
  ...divAttributes
}: JudgmentRowProps) {
  const isClearOffered = isActive && rating !== 0 && Boolean(onClear);
  return (
    <div
      className={joinClassNames(styles.judgmentRow, className)}
      data-active={isActive || undefined}
      data-rated={rating !== 0 || undefined}
      {...divAttributes}
    >
      <div className={styles.line}>
        <span className={styles.category}>{category || "No category"}</span>
        <StarRating
          label={category || "Rating"}
          value={rating}
          onRatingChange={onRatingChange}
          density={density}
        />
        <PolarityTag className={styles.polarity} rating={rating} />
        {isClearOffered ? (
          <button type="button" className={styles.clear} onClick={onClear}>
            CLEAR <span aria-hidden="true">×</span>
          </button>
        ) : null}
      </div>
      {note ? <p className={styles.note}>“{note}”</p> : null}
    </div>
  );
}
