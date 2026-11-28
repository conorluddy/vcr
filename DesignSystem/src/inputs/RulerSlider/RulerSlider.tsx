import { useId } from "react";
import { joinClassNames } from "../../shared/joinClassNames";
import type { StyleWithVariables } from "../../shared/styleWithVariables.types";
import styles from "./RulerSlider.module.css";
import type { RulerSliderProps } from "./RulerSlider.types";

// === PUBLIC API ===

/** Ruler slider: hairline rail, 10% ticks, bone thumb and a tabular value. A native range input does the work. */
export function RulerSlider({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  unit,
  decimalPlaces = 0,
  onValueChange,
  size = "desktop",
  className,
  ...inputAttributes
}: RulerSliderProps) {
  const inputId = useId();
  const trackStyle: StyleWithVariables = { "--ruler-percent": `${percentAlong(value, min, max)}%` };
  return (
    <div className={joinClassNames(styles.rulerSlider, className)} data-size={size}>
      <div className={styles.header}>
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
        <output htmlFor={inputId} className={styles.value}>
          {value.toFixed(decimalPlaces)}
          {unit ? <span className={styles.unit}>{unit}</span> : null}
        </output>
      </div>
      <div className={styles.track} style={trackStyle}>
        <span className={styles.rail} />
        <span className={styles.ticks} />
        <span className={styles.fill} />
        <span className={styles.thumb} />
        <input
          id={inputId}
          type="range"
          className={styles.input}
          min={min}
          max={max}
          step={step}
          value={value}
          readOnly={!onValueChange}
          onChange={(event) => onValueChange?.(Number.parseFloat(event.target.value))}
          {...inputAttributes}
        />
      </div>
    </div>
  );
}

// === PRIVATE HELPERS ===

function percentAlong(value: number, min: number, max: number): number {
  if (max <= min) {
    return 0;
  }
  return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
}
