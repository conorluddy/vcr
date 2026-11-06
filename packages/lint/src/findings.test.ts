import { describe, expect, test } from "vitest";
import { findingsForSample, markerTimes, mergeFindings, safeRectangle, sampleTimes } from "./findings.js";
import type { PageMeasurement, SafeZone } from "./lint.types.js";

const rail: SafeZone = { name: "test-9x16", width: 1080, height: 1920, inset: { top: 288, right: 192, bottom: 672, left: 65 }, tier: "heuristic", source: "test", verified: false };
const emptyPage: PageMeasurement = { zeroHeightRoot: null, overflows: [], texts: [], hasCanvas: false, sceneTextBounds: null, textBoundsError: null };
const context = { scene: "scene.html", t: 1, width: 1080, height: 1920, safeZone: rail };
const textAt = (left: number, right: number, top = 600, bottom = 680) => ({ selector: "#title", text: "Final call", rect: { left, top, right, bottom } });

describe("sample times", () => {
  test("evenly spaced samples end one frame before the duration", () => {
    expect(sampleTimes(3, 30, 4)).toEqual([0, 0.989, 1.978, 2.967]);
  });

  test("explicit times win over markers, and markers over even sampling", () => {
    expect(sampleTimes(3, 30, 8, [1.5], [2])).toEqual([1.5]);
    expect(sampleTimes(3, 30, 8, undefined, [2, 2.9])).toEqual([2, 2.9]);
  });
});

describe("marker times", () => {
  test("plain seconds and named markers can be mixed", () => {
    expect(markerTimes([1.9, { t: 3.9, id: "B02", role: "payoff" }])).toEqual([1.9, 3.9]);
  });

  test("a malformed entry rejects the whole list", () => {
    expect(markerTimes([1.9, { id: "B02" }])).toBeUndefined();
    expect(markerTimes("1.9")).toBeUndefined();
  });
});

describe("findings for one sample", () => {
  test("text crossing the right action rail is a TYPO-SAFE finding carrying the preset's verified flag", () => {
    const [finding] = findingsForSample({ ...emptyPage, texts: [textAt(640, 982)] }, context);
    expect(finding).toMatchObject({ rule: "TYPO-SAFE", selector: "#title", measured: 982, limit: 888, verified: false });
  });

  test("text inside the safe rectangle yields nothing", () => {
    expect(findingsForSample({ ...emptyPage, texts: [textAt(120, 360)] }, context)).toEqual([]);
  });

  test("text leaving the frame is out-of-frame, not also a safe-zone crossing", () => {
    expect(findingsForSample({ ...emptyPage, texts: [textAt(900, 1200)] }, context).map((finding) => finding.rule)).toEqual(["out-of-frame"]);
  });

  test("scene textBounds go through the same checks as DOM text", () => {
    const sceneTextBounds = [{ label: "hook", rect: { left: 640, top: 600, right: 982, bottom: 680 } }];
    expect(findingsForSample({ ...emptyPage, sceneTextBounds }, context)).toMatchObject([{ rule: "TYPO-SAFE", selector: "textBounds:hook" }]);
  });

  test("overflow and a collapsed root are reported regardless of safe zone", () => {
    const measurement = { ...emptyPage, zeroHeightRoot: "#stage", overflows: [{ selector: "#box", axis: "y" as const, scrollSize: 144, clientSize: 100 }] };
    expect(findingsForSample(measurement, { ...context, safeZone: null }).map((finding) => finding.rule)).toEqual(["root-zero-height", "overflow"]);
  });

  test("insets scale with the viewport when it differs from the preset canvas", () => {
    expect(safeRectangle(rail, 540, 960)).toEqual({ left: 32.5, top: 144, right: 444, bottom: 624 });
  });
});

describe("merging samples", () => {
  test("one finding per selector and rule, kept at the worst sample", () => {
    const early = findingsForSample({ ...emptyPage, texts: [textAt(640, 900)] }, { ...context, t: 0 });
    const late = findingsForSample({ ...emptyPage, texts: [textAt(640, 982)] }, { ...context, t: 2 });
    expect(mergeFindings([...early, ...late])).toMatchObject([{ t: 2, measured: 982 }]);
  });
});
