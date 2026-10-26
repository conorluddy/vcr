// Time contract from PRD §9. Every time value carries its domain in the type so frames,
// seconds and samples can never be mixed by accident. Types and constructors only; the
// resolver that maps composition time to clip and source time belongs to Layer 2.

// === BRANDED SCALARS ===

declare const brand: unique symbol;
type Branded<T, Name extends string> = T & { readonly [brand]: Name };

/** Integer frame index on the composition clock. Editorial boundaries live here. */
export type CompositionFrame = Branded<number, "CompositionFrame">;

/** Integer frame index local to one clip, starting at 0 when the clip begins. */
export type ClipLocalFrame = Branded<number, "ClipLocalFrame">;

/** Position in a source asset, in seconds. Only produced by a time map, never authored by hand. */
export type SourceSeconds = Branded<number, "SourceSeconds">;

/** Integer sample index in an audio asset's own sample-rate domain. */
export type AudioSample = Branded<number, "AudioSample">;

/** Frames per second as an exact ratio, so 29.97 is 30000/1001 and never a float. */
export interface RationalFps {
  readonly numerator: number;
  readonly denominator: number;
}

/** Start-inclusive, end-exclusive frame span: [start, end). */
export interface FrameInterval {
  readonly start: CompositionFrame;
  readonly end: CompositionFrame;
}

// === RESULT ===

export type TimeResult<T> = { ok: true; value: T } | { ok: false; error: TimeError };

export interface TimeError {
  code: "NEGATIVE_FRAME" | "NON_INTEGER_FRAME" | "INVALID_FPS" | "EMPTY_INTERVAL";
  message: string;
}

// === CONSTRUCTORS ===

export function compositionFrame(value: number): TimeResult<CompositionFrame> {
  return integerFrame(value, "composition frame") as TimeResult<CompositionFrame>;
}

export function clipLocalFrame(value: number): TimeResult<ClipLocalFrame> {
  return integerFrame(value, "clip-local frame") as TimeResult<ClipLocalFrame>;
}

export function audioSample(value: number): TimeResult<AudioSample> {
  return integerFrame(value, "audio sample") as TimeResult<AudioSample>;
}

export function sourceSeconds(value: number): TimeResult<SourceSeconds> {
  if (!Number.isFinite(value) || value < 0) return fail("NEGATIVE_FRAME", `source seconds must be finite and >= 0, got ${value}`);
  return ok(value as SourceSeconds);
}

export function rationalFps(numerator: number, denominator = 1): TimeResult<RationalFps> {
  if (!Number.isInteger(numerator) || !Number.isInteger(denominator) || numerator <= 0 || denominator <= 0) {
    return fail("INVALID_FPS", `fps must be a ratio of positive integers, got ${numerator}/${denominator}`);
  }
  const divisor = greatestCommonDivisor(numerator, denominator);
  return ok({ numerator: numerator / divisor, denominator: denominator / divisor });
}

export function frameInterval(start: CompositionFrame, end: CompositionFrame): TimeResult<FrameInterval> {
  if (end <= start) return fail("EMPTY_INTERVAL", `interval end must be after start, got [${start}, ${end})`);
  return ok({ start, end });
}

// === COMMON PRESETS ===

export const FPS_24: RationalFps = { numerator: 24, denominator: 1 };
export const FPS_25: RationalFps = { numerator: 25, denominator: 1 };
export const FPS_30: RationalFps = { numerator: 30, denominator: 1 };
export const FPS_60: RationalFps = { numerator: 60, denominator: 1 };
export const FPS_29_97: RationalFps = { numerator: 30000, denominator: 1001 };

// === PRIVATE HELPERS ===

function integerFrame(value: number, label: string): TimeResult<number> {
  if (!Number.isInteger(value)) return fail("NON_INTEGER_FRAME", `${label} must be an integer, got ${value}`);
  if (value < 0) return fail("NEGATIVE_FRAME", `${label} must be >= 0, got ${value}`);
  return ok(value);
}

function greatestCommonDivisor(left: number, right: number): number {
  return right === 0 ? left : greatestCommonDivisor(right, left % right);
}

function ok<T>(value: T): TimeResult<T> {
  return { ok: true, value };
}

function fail(code: TimeError["code"], message: string): TimeResult<never> {
  return { ok: false, error: { code, message } };
}
