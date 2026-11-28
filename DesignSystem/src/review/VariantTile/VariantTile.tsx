import type { ReactNode } from "react";
import { joinClassNames } from "../../shared/joinClassNames";
import type { StyleWithVariables } from "../../shared/styleWithVariables.types";
import styles from "./VariantTile.module.css";
import type { VariantTileProps } from "./VariantTile.types";

// === PUBLIC API ===

/** Contact-sheet tile: the whole design on the neutral backing, its ID and mark count. Every state keeps the footprint. */
export function VariantTile({
  variantId,
  state = "done",
  src,
  aspectRatio = "4 / 5",
  markCount = 0,
  isSelected = false,
  onOpen,
  onRetry,
  className,
  style,
  ...divAttributes
}: VariantTileProps) {
  const tileStyle: StyleWithVariables = { ...style, "--variant-aspect-ratio": aspectRatio };
  return (
    <div
      className={joinClassNames(styles.variantTile, className)}
      data-state={state}
      data-selected={isSelected || undefined}
      style={tileStyle}
      {...divAttributes}
    >
      {renderFrame({ variantId, state, src, onOpen, onRetry })}
      <div className={styles.footer}>
        <span>{variantId}</span>
        {markCount > 0 ? (
          <span className={styles.marks}>
            <span aria-hidden="true">◆ </span>
            {markCount}
            <span className="vcr-visually-hidden"> {markCount === 1 ? "mark" : "marks"}</span>
          </span>
        ) : null}
      </div>
    </div>
  );
}

// === PRIVATE HELPERS ===

type FrameInput = Pick<VariantTileProps, "variantId" | "state" | "src" | "onOpen" | "onRetry">;

function renderFrame({ variantId, state, src, onOpen, onRetry }: FrameInput): ReactNode {
  if (state === "pending") {
    return (
      <div className={styles.frame}>
        <div className={joinClassNames(styles.art, styles.pending)}>PENDING</div>
      </div>
    );
  }
  if (state === "failed") {
    return (
      <div className={styles.frame}>
        <div className={joinClassNames(styles.art, styles.failed)}>
          <span className={styles.faultChip}>
            <span aria-hidden="true">◇ </span>FAILED
          </span>
          <button type="button" className={styles.retry} onClick={onRetry}>
            RETRY <span aria-hidden="true">↻</span>
          </button>
        </div>
      </div>
    );
  }
  return (
    <button type="button" className={styles.frame} aria-label={`Open ${variantId}`} onClick={onOpen}>
      <div className={joinClassNames(styles.art, styles.done)}>
        {src ? (
          <img className={styles.image} src={src} alt="" />
        ) : (
          <span aria-hidden="true">{variantId}</span>
        )}
      </div>
    </button>
  );
}
