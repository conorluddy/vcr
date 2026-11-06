import { join } from "node:path";
import { describe, expect, test } from "vitest";
import type { SeriesBrief } from "./brief.js";
import { checkPlan, defaultPlanThresholds, planMarkers, type Beat, type BeatSheet } from "./plan-check.js";
import { writeFileAtomic } from "./repository.js";
import { createFixtureWorkspace, harnessRoot, writeJson } from "./test-workspace.js";
import { validateWorkspace } from "./validate.js";

const thresholds = defaultPlanThresholds({ min_hold_s: 1.2, per_word_s: 0.3, base_s: 0.5 });
const seriesBrief = { id: "s", version: "1.0.0", tokens: { file: "t.json" }, deliverables: [], mandatories: [{ id: "M-LOGO", rule: "Logo at rest in the last beat" }] } satisfies SeriesBrief;

function beat(id: string, overrides: Partial<Beat> = {}): Beat {
  return { id, purpose: "Land one idea.", must_show: ["a thing"], on_screen_text: null, vo: null, duration_s: 2, transition_in: "cut", transition_out: "cut", ...overrides };
}

/** 6 s at 30 fps: a hook with text, a narrated middle, a quiet end that carries the mandatory. */
function cleanSheet(): BeatSheet {
  return {
    schema_version: "1.0.0",
    video_id: "demo/teaser",
    fps: 30,
    target_s: 6,
    beats: [
      beat("B01", { role: "hook", on_screen_text: "Where's it going?" }),
      beat("B02", { role: "promise", vo: "Your files follow you now." }),
      beat("B03", { role: "payoff", mandatories: ["M-LOGO"] }),
    ],
  };
}

const rulesOf = (sheet: BeatSheet, brief: SeriesBrief | undefined = seriesBrief) => checkPlan(sheet, brief, thresholds, "0".repeat(64)).map((finding) => `${finding.rule_id}${finding.beat_id ? ` ${finding.beat_id}` : ""}`);

describe("plan checks", () => {
  test("a clean sheet has no findings", () => {
    expect(checkPlan(cleanSheet(), seriesBrief, thresholds, "abc")).toEqual([]);
  });

  test("beats one frame short of the target fail STORY-BEAT-SUM", () => {
    const sheet = cleanSheet();
    sheet.beats[2]!.duration_s = 2 - 1 / 30;
    const [finding] = checkPlan(sheet, seriesBrief, thresholds, "abc");
    expect(finding).toMatchObject({ rule_id: "STORY-BEAT-SUM", severity: "major", kind: "measured", confidence: { value: 1, basis: "deterministic" }, evidence: { value: 179, threshold: 180 }, plan_sha256: "abc", author: { name: "vcr-plan" } });
    expect(finding).not.toHaveProperty("render_id");
  });

  test("a VO beat over the narration rate fails STORY-WORD-BUDGET for the beat and the total", () => {
    const sheet = cleanSheet();
    sheet.beats[1]!.vo = "one two three four five six seven eight nine ten eleven twelve";
    expect(rulesOf(sheet)).toEqual(["STORY-WORD-BUDGET B02", "STORY-WORD-BUDGET"]);
  });

  test("text held shorter than TYPO-HOLD fails STORY-TEXT-READTIME", () => {
    const sheet = cleanSheet();
    sheet.beats[0]!.on_screen_text = "Your files follow you, not your device.";
    expect(rulesOf(sheet)).toEqual(["STORY-TEXT-READTIME B01"]);
  });

  test("a series mandatory in no beat is a STORY-MANDATORY-MAP blocker", () => {
    const sheet = cleanSheet();
    delete sheet.beats[2]!.mandatories;
    expect(checkPlan(sheet, seriesBrief, thresholds, "abc")).toEqual([expect.objectContaining({ rule_id: "STORY-MANDATORY-MAP", severity: "blocker" })]);
    expect(checkPlan(sheet, undefined, thresholds, "abc")).toEqual([]);
  });

  test("a narrated piece with no VO-free beat gets a STORY-VO-AIR note", () => {
    const sheet = cleanSheet();
    sheet.beats = sheet.beats.map((entry) => ({ ...entry, vo: "Short line." }));
    expect(checkPlan(sheet, seriesBrief, thresholds, "abc")).toEqual([expect.objectContaining({ rule_id: "STORY-VO-AIR", severity: "note" })]);
  });

  test("a promise after 3 s or a hook after 6 s is an advisory STORY-HOOK-WINDOW", () => {
    const sheet = { ...cleanSheet(), target_s: 10 };
    sheet.beats = [beat("B01", { duration_s: 3.5 }), beat("B02", { role: "promise", duration_s: 3 }), beat("B03", { role: "hook", mandatories: ["M-LOGO"], duration_s: 3.5 })];
    expect(checkPlan(sheet, seriesBrief, thresholds, "abc")).toEqual([
      expect.objectContaining({ rule_id: "STORY-HOOK-WINDOW", severity: "minor", beat_id: "B02" }),
      expect.objectContaining({ rule_id: "STORY-HOOK-WINDOW", severity: "minor", beat_id: "B03" }),
    ]);
  });

  test("markers sit on each beat's last frame", () => {
    expect(planMarkers(cleanSheet())).toEqual([
      { t: 1.966667, id: "B01", role: "hook" },
      { t: 3.966667, id: "B02", role: "promise" },
      { t: 5.966667, id: "B03", role: "payoff" },
    ]);
  });
});

describe("beat sheet validation", () => {
  const brief = "---\nvideo_id: demo/teaser\ndeliverables: [1080x1920@30]\n---\n\n## Objective\nx\n\n## Audience and placement\nx\n\n## Content\nx\n\n## Constraints\nx\n\n## Review notes\nx\n";
  const errors = (sheet: unknown) => {
    const { root, videoDirectory } = createFixtureWorkspace();
    writeFileAtomic(join(videoDirectory, "brief.md"), brief);
    writeJson(join(videoDirectory, "beats.json"), sheet);
    return validateWorkspace(harnessRoot(), root).diagnostics.filter((diagnostic) => diagnostic.severity === "error").map((diagnostic) => `${diagnostic.path}: ${diagnostic.message} ${diagnostic.suggestion ?? ""}`);
  };

  test("a clean sheet validates", () => {
    expect(errors(cleanSheet())).toEqual([]);
  });

  test("a beat without a purpose cites STORY-BEAT-FIELDS", () => {
    const sheet = cleanSheet();
    const { purpose: _purpose, ...withoutPurpose } = sheet.beats[0]!;
    expect(errors({ ...sheet, beats: [withoutPurpose, ...sheet.beats.slice(1)] })).toEqual([expect.stringMatching(/^\/beats\/0: .*purpose.*STORY-BEAT-FIELDS/)]);
  });

  test.each([
    ["a duplicate beat id", (sheet: BeatSheet) => { sheet.beats[1]!.id = "B01"; }, "duplicate beat id B01"],
    ["a video_id from another folder", (sheet: BeatSheet) => { sheet.video_id = "demo/other"; }, "does not match its directory"],
    ["an fps that is not a deliverable", (sheet: BeatSheet) => { sheet.fps = 25; }, "fps 25 is not a deliverable rate"],
  ])("rejects %s", (_label, mutate, expected) => {
    const sheet = cleanSheet();
    mutate(sheet);
    expect(errors(sheet)).toEqual([expect.stringContaining(expected)]);
  });
});
