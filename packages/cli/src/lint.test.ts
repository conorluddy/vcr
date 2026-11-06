import { describe, expect, test } from "vitest";
import { formatLintReport, parseSampleTimes } from "./lint.js";

describe("vcr lint arguments and output", () => {
  test("--at parses comma-separated seconds and rejects anything else", () => {
    expect(parseSampleTimes("0.5, 2.9")).toEqual({ ok: true, value: [0.5, 2.9] });
    expect(parseSampleTimes(undefined)).toEqual({ ok: true, value: undefined });
    expect(parseSampleTimes("1,soon").ok).toBe(false);
  });

  test("the text report names unverified presets and unassessable scenes", () => {
    const output = formatLintReport({
      scenes: ["a.html", "b.html"],
      samples: { "a.html": [0, 1], "b.html": [0] },
      findings: [{ scene: "a.html", t: 1, selector: "#title", text: "Hi", rule: "TYPO-SAFE", measured: 982, limit: 888, problem: "crosses", verified: false }],
      unableToAssess: [{ scene: "b.html", reason: "canvas" }],
    });
    expect(output.split("\n")).toEqual([
      'a.html t=1s TYPO-SAFE [unverified preset] #title "Hi": crosses',
      "b.html: unable to assess: canvas",
      "1 findings in 2 scenes (3 samples); 1 unable to assess",
    ]);
  });
});
