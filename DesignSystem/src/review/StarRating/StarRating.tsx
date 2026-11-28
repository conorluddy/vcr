import { useId } from "react";
import { joinClassNames } from "../../shared/joinClassNames";
import { RATING_MEANINGS, type Rating } from "../rating.types";
import styles from "./StarRating.module.css";
import type { StarRatingProps } from "./StarRating.types";

// === PUBLIC API ===

/**
 * Five-star judgment control built on native radios, so arrow keys move between stars. 0 is unrated; pressing the
 * current star clears it. The hover preview is pure CSS.
 */
export function StarRating({
  value = 0,
  onRatingChange,
  density = "popover",
  label = "Rating",
  isReadOnly = false,
  className,
  ...fieldsetAttributes
}: StarRatingProps) {
  const groupName = useId();
  return (
    <fieldset
      aria-label={`${label}: ${describeValue(value)}`}
      className={joinClassNames(styles.starRating, className)}
      data-density={density}
      data-read-only={isReadOnly || undefined}
      disabled={isReadOnly}
      {...fieldsetAttributes}
    >
      {STAR_VALUES.map((starValue) => (
        <label key={starValue} className={styles.star} data-filled={starValue <= value || undefined}>
          <input
            type="radio"
            className="vcr-visually-hidden"
            name={groupName}
            value={starValue}
            checked={value === starValue}
            aria-label={`${starValue} of 5, ${RATING_MEANINGS[starValue]}`}
            readOnly
            onClick={() => onRatingChange?.(value === starValue ? 0 : starValue)}
          />
        </label>
      ))}
    </fieldset>
  );
}

// === PRIVATE HELPERS ===

const STAR_VALUES: ReadonlyArray<Exclude<Rating, 0>> = [1, 2, 3, 4, 5];

function describeValue(value: Rating): string {
  return value === 0 ? RATING_MEANINGS[0] : `${value} of 5, ${RATING_MEANINGS[value]}`;
}
