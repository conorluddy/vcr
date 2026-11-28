import { joinClassNames } from "../../shared/joinClassNames";
import type { StyleWithVariables } from "../../shared/styleWithVariables.types";
import styles from "./ChoiceTile.module.css";
import type { ChoiceTileProps } from "./ChoiceTile.types";

// === PUBLIC API ===

/** One selectable option tile; lay several out with ChoiceGrid. */
export function ChoiceTile({
  label,
  isSelected = false,
  swatchColor,
  size = "desktop",
  className,
  ...buttonAttributes
}: ChoiceTileProps) {
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      className={joinClassNames(styles.choiceTile, className)}
      data-size={size}
      {...buttonAttributes}
    >
      {swatchColor ? (
        <span className={styles.swatch} style={swatchStyle(swatchColor)} aria-hidden="true" />
      ) : null}
      <span>{label}</span>
    </button>
  );
}

// === PRIVATE HELPERS ===

function swatchStyle(swatchColor: string): StyleWithVariables {
  return { "--swatch-color": swatchColor };
}
