// Pure half of lint: page measurements in, findings out. No browser, so it is unit-tested directly.
import type { LintFinding, PageMeasurement, Rectangle, SafeZone } from "./lint.types.js";

// === TYPES ===

interface SampleContext {
  scene: string;
  t: number;
  width: number;
  height: number;
  safeZone: SafeZone | null;
}

/** Sub-pixel layout and antialiasing should not count as a crossing. */
const EDGE_TOLERANCE_PX = 0.5;
/** Grapla's lint allowed one pixel of rounding between scroll and client sizes. */
export const OVERFLOW_TOLERANCE_PX = 1;
const TEXT_PREVIEW_CHARACTERS = 30;

// === PUBLIC API ===

/** Explicit times win, then scene markers, then `samples` evenly spaced from 0 to the last frame (duration − 1/fps). */
export function sampleTimes(duration: number, fps: number, samples: number, explicit?: number[], markers?: number[]): number[] {
  if (explicit && explicit.length > 0) return explicit;
  if (markers && markers.length > 0) return markers;
  const lastFrame = Math.max(0, duration - 1 / fps);
  if (samples <= 1) return [lastFrame];
  return Array.from({ length: samples }, (_, index) => roundTime((lastFrame * index) / (samples - 1)));
}

/** The safe rectangle in viewport pixels, scaling the preset's insets when the viewport differs from its canvas. */
export function safeRectangle(safeZone: SafeZone, width: number, height: number): Rectangle {
  const scaleX = width / safeZone.width;
  const scaleY = height / safeZone.height;
  return { left: safeZone.inset.left * scaleX, top: safeZone.inset.top * scaleY, right: width - safeZone.inset.right * scaleX, bottom: height - safeZone.inset.bottom * scaleY };
}

export function findingsForSample(measurement: PageMeasurement, context: SampleContext): LintFinding[] {
  const base = { scene: context.scene, t: context.t };
  const findings: LintFinding[] = [];
  if (measurement.zeroHeightRoot !== null) {
    findings.push({ ...base, selector: measurement.zeroHeightRoot, rule: "root-zero-height", measured: 0, limit: 1, problem: "scene root has zero height; give it an explicit height (e.g. 100%) so children are laid out against the frame", verified: true });
  }
  for (const overflow of measurement.overflows) {
    findings.push({ ...base, selector: overflow.selector, rule: "overflow", measured: overflow.scrollSize, limit: overflow.clientSize, problem: `content is ${round(overflow.scrollSize - overflow.clientSize)} px ${overflow.axis === "y" ? "taller" : "wider"} than its box; shorten the copy, enlarge the box or reduce the type size`, verified: true });
  }
  const textBoxes = [...measurement.texts, ...(measurement.sceneTextBounds ?? []).map((bound) => ({ selector: `textBounds:${bound.label}`, text: bound.label, rect: bound.rect }))];
  const frame: Rectangle = { left: 0, top: 0, right: context.width, bottom: context.height };
  const safe = context.safeZone ? safeRectangle(context.safeZone, context.width, context.height) : null;
  for (const box of textBoxes) {
    const text = box.text.trim().slice(0, TEXT_PREVIEW_CHARACTERS);
    const outOfFrame = worstCrossing(box.rect, frame);
    if (outOfFrame) {
      findings.push({ ...base, selector: box.selector, text, rule: "out-of-frame", measured: outOfFrame.measured, limit: outOfFrame.limit, problem: `text ${outOfFrame.edge} edge at ${round(outOfFrame.measured)} px leaves the ${context.width}×${context.height} frame`, verified: true });
      continue;
    }
    const crossing = safe ? worstCrossing(box.rect, safe) : null;
    if (crossing && context.safeZone) {
      findings.push({ ...base, selector: box.selector, text, rule: "TYPO-SAFE", measured: crossing.measured, limit: crossing.limit, problem: `text ${crossing.edge} edge at ${round(crossing.measured)} px crosses the ${context.safeZone.name} safe edge at ${round(crossing.limit)} px`, verified: context.safeZone.verified });
    }
  }
  return findings;
}

/** One finding per scene, selector and rule across samples, keeping the sample where it was worst. */
export function mergeFindings(findings: LintFinding[]): LintFinding[] {
  const worst = new Map<string, LintFinding>();
  for (const finding of findings) {
    const key = `${finding.scene}\u0000${finding.selector}\u0000${finding.rule}`;
    const current = worst.get(key);
    if (!current || Math.abs(finding.measured - finding.limit) > Math.abs(current.measured - current.limit)) worst.set(key, finding);
  }
  return [...worst.values()];
}

// === PRIVATE HELPERS ===

/** The edge of `rect` that goes furthest outside `bounds`, or null when it stays inside. */
function worstCrossing(rect: Rectangle, bounds: Rectangle): { edge: "left" | "top" | "right" | "bottom"; measured: number; limit: number } | null {
  const crossings = [
    { edge: "left" as const, measured: rect.left, limit: bounds.left, excess: bounds.left - rect.left },
    { edge: "top" as const, measured: rect.top, limit: bounds.top, excess: bounds.top - rect.top },
    { edge: "right" as const, measured: rect.right, limit: bounds.right, excess: rect.right - bounds.right },
    { edge: "bottom" as const, measured: rect.bottom, limit: bounds.bottom, excess: rect.bottom - bounds.bottom },
  ].filter((crossing) => crossing.excess > EDGE_TOLERANCE_PX);
  if (crossings.length === 0) return null;
  const { edge, measured, limit } = crossings.reduce((left, right) => (right.excess > left.excess ? right : left));
  return { edge, measured, limit };
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

function roundTime(seconds: number): number {
  return Math.round(seconds * 1000) / 1000;
}
