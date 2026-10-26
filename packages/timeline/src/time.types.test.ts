import { describe, expect, test } from "vitest";
import { audioSample, compositionFrame, frameInterval, rationalFps, sourceSeconds } from "./time.types.js";

const unwrap = <T>(result: { ok: true; value: T } | { ok: false; error: { code: string } }): T => {
  if (!result.ok) throw new Error(result.error.code);
  return result.value;
};

describe("frame constructors", () => {
  test("accept non-negative integers", () => {
    expect(unwrap(compositionFrame(0))).toBe(0);
    expect(unwrap(audioSample(48000))).toBe(48000);
  });
  test("reject negative frames", () => {
    const result = compositionFrame(-1);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("NEGATIVE_FRAME");
  });
  test("reject fractional frames so seconds can never leak in", () => {
    const result = compositionFrame(12.5);
    if (!result.ok) expect(result.error.code).toBe("NON_INTEGER_FRAME");
    else throw new Error("expected failure");
  });
});

describe("rationalFps", () => {
  test("reduces 30000/1001 to lowest terms and keeps it exact", () => {
    expect(unwrap(rationalFps(60000, 2002))).toEqual({ numerator: 30000, denominator: 1001 });
  });
  test("rejects floats and zero", () => {
    expect(rationalFps(29.97).ok).toBe(false);
    expect(rationalFps(0).ok).toBe(false);
  });
});

describe("frameInterval", () => {
  test("is start-inclusive, end-exclusive and never empty", () => {
    const start = unwrap(compositionFrame(10));
    const end = unwrap(compositionFrame(10));
    expect(frameInterval(start, end).ok).toBe(false);
    expect(unwrap(frameInterval(start, unwrap(compositionFrame(11))))).toEqual({ start: 10, end: 11 });
  });
});

describe("sourceSeconds", () => {
  test("rejects negative and non-finite", () => {
    expect(sourceSeconds(-0.1).ok).toBe(false);
    expect(sourceSeconds(Number.NaN).ok).toBe(false);
    expect(unwrap(sourceSeconds(1.5))).toBe(1.5);
  });
});
