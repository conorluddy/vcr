import type { HTMLAttributes } from "react";

// === TYPES ===

export interface CropThumbProps extends HTMLAttributes<HTMLDivElement> {
  /** Image of the cropped region; it covers the frame. */
  src?: string | undefined;
  /** Text alternative for `src`; empty when the row already names the region. */
  alt?: string | undefined;
  /** Placeholder text when there is no image, e.g. "HEADLINE". */
  label?: string | undefined;
  /** −45° hatch for imagery not supplied yet. */
  isHatched?: boolean | undefined;
  /** Sit on the artboard backing at full width, as in the Marked details sheet. */
  isPadded?: boolean | undefined;
  /** Default 72; ignored when padded, which fills the width. */
  widthPx?: number | undefined;
  /** Default 32. */
  heightPx?: number | undefined;
}
