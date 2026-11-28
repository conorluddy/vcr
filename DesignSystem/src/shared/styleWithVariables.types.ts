import type { CSSProperties } from "react";

// === TYPES ===

/** Inline style that sets component-scoped custom properties, used only for values that are data (a percentage, a swatch). */
export type StyleWithVariables = CSSProperties & Readonly<Record<`--${string}`, string>>;
