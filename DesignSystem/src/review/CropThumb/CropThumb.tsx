import { joinClassNames } from "../../shared/joinClassNames";
import type { StyleWithVariables } from "../../shared/styleWithVariables.types";
import styles from "./CropThumb.module.css";
import type { CropThumbProps } from "./CropThumb.types";

// === PUBLIC API ===

/** Crop of a marked region: bare in list rows and popovers, padded on the neutral backing in the details sheet. */
export function CropThumb({
  src,
  alt = "",
  label,
  isHatched = false,
  isPadded = false,
  widthPx = 72,
  heightPx = 32,
  className,
  style,
  ...divAttributes
}: CropThumbProps) {
  const thumbStyle: StyleWithVariables = {
    ...style,
    "--crop-width": `${widthPx}px`,
    "--crop-height": `${heightPx}px`,
  };
  return (
    <div
      className={joinClassNames(styles.cropThumb, className)}
      data-padded={isPadded || undefined}
      style={thumbStyle}
      {...divAttributes}
    >
      <div className={styles.art} data-hatched={(isHatched && !src) || undefined}>
        {src ? <img className={styles.image} src={src} alt={alt} /> : null}
        {!src && !isHatched && label ? <span>{label}</span> : null}
      </div>
    </div>
  );
}
