// Contract for `vcr lint`: layout checks on a browser scene at sampled times. Thresholds come
// from references/typography/rules.json (TYPO-SAFE presets); nothing numeric is defined here.

// === TYPES ===

export interface Rectangle {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/** One preset from `safe_zones` in rules.json. Insets are pixels on a `width` × `height` canvas. */
export interface SafeZone {
  name: string;
  width: number;
  height: number;
  inset: { top: number; right: number; bottom: number; left: number };
  tier: "standard" | "platform" | "heuristic";
  source: string;
  /** False when the preset's figures are unverified in the KB ledger; every finding using it carries the flag. */
  verified: boolean;
}

export interface LintOptions {
  /** Absolute path to the scene page. */
  sceneFile: string;
  width: number;
  height: number;
  /** null lints overflow and frame edges only. */
  safeZone: SafeZone | null;
  /** Explicit sample times in seconds; wins over markers and even sampling. */
  times?: number[] | undefined;
  /** Sample at `window.__scene.markers` (seconds) instead of evenly. */
  useMarkers?: boolean | undefined;
  /** Evenly spaced samples, from 0 to the last frame. */
  samples: number;
  /** Used only to place the last sample one frame before the end. */
  fps: number;
  playwrightRuntimeDirectory?: string | undefined;
  chromiumArgs?: string[] | undefined;
}

/**
 * `root-zero-height`: the scene root collapsed, so nothing is laid out where the author thinks.
 * `overflow`: a clipping or scrolling box holds more content than it shows.
 * `out-of-frame`: visible text extends past the viewport.
 * `TYPO-SAFE`: visible text crosses the selected safe-zone rectangle.
 */
export type LintRule = "root-zero-height" | "overflow" | "out-of-frame" | "TYPO-SAFE";

export interface LintFinding {
  scene: string;
  /** Seconds; the sample where the measurement was worst. */
  t: number;
  frame?: number;
  selector: string;
  /** First 30 characters of the text involved, when there is text. */
  text?: string;
  rule: LintRule;
  /** Pixels: the offending edge or scroll size. */
  measured: number;
  /** Pixels: the edge or client size it should stay within. */
  limit: number;
  problem: string;
  verified: boolean;
}

export interface UnableToAssess {
  scene: string;
  reason: string;
}

export interface LintReport {
  scenes: string[];
  /** Sample times used, per scene, in seconds. */
  samples: Record<string, number[]>;
  findings: LintFinding[];
  /** Scenes lint could not see into. Never a pass; never a failure either. */
  unableToAssess: UnableToAssess[];
}

/** What the page reports at one sample time; produced by `measurePage` inside Chromium. */
export interface PageMeasurement {
  /** Selector of the first laid-out child of body when its height is 0, else null. */
  zeroHeightRoot: string | null;
  overflows: Array<{ selector: string; axis: "x" | "y"; scrollSize: number; clientSize: number }>;
  /** Visible DOM text, one entry per text node, bounded by the union of its client rects. Text inside an overflowing box is excluded: the overflow finding covers it. */
  texts: Array<{ selector: string; text: string; rect: Rectangle }>;
  hasCanvas: boolean;
  /** From `window.__scene.textBounds()` when the scene provides it, else null. */
  sceneTextBounds: Array<{ label: string; rect: Rectangle }> | null;
  /** Set when textBounds exists but returned something other than an array of {x, y, width, height}. */
  textBoundsError: string | null;
}
