import { joinClassNames } from "../../shared/joinClassNames";
import type { StyleWithVariables } from "../../shared/styleWithVariables.types";
import { ChoiceTile } from "../ChoiceTile/ChoiceTile";
import styles from "./ChoiceGrid.module.css";
import type { ChoiceGridProps } from "./ChoiceGrid.types";

// === PUBLIC API ===

/** Single-choice grid of ChoiceTiles, three columns by default. Name the group with aria-label. */
export function ChoiceGrid({
  options,
  value,
  onValueChange,
  swatchColors,
  columnCount = 3,
  size = "desktop",
  className,
  style,
  ...divAttributes
}: ChoiceGridProps) {
  const gridStyle: StyleWithVariables = { ...style, "--choice-grid-columns": String(columnCount) };
  return (
    <fieldset
      className={joinClassNames(styles.choiceGrid, className)}
      data-size={size}
      style={gridStyle}
      {...divAttributes}
    >
      {options.map((option, index) => (
        <ChoiceTile
          key={option}
          label={option}
          size={size}
          swatchColor={swatchColors?.[index]}
          isSelected={option === value}
          onClick={() => onValueChange?.(option)}
        />
      ))}
    </fieldset>
  );
}
