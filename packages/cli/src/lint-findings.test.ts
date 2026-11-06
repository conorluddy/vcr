import { describe, expect, test } from "vitest";
import type { LintFinding, LintReport, SafeZone } from "@vcr/lint";
import { findingDraftFromLint, writeLintFindings } from "./lint-findings.js";
import { validateWorkspace } from "./validate.js";
import { createFixtureWorkspace, fixtureManifest, harnessRoot, writeRetainedManifest } from "./test-workspace.js";

const tiktok: SafeZone = { name: "tiktok", width: 1080, height: 1920, inset: { top: 160, right: 120, bottom: 400, left: 60 }, tier: "platform", source: "fixture", verified: true };
const crossing: LintFinding = { scene: "scene.html", t: 1.5, selector: "#headline", text: "Big news", rule: "TYPO-SAFE", measured: 1010, limit: 960, problem: "text right edge at 1010 px crosses the tiktok safe edge at 960 px", verified: true };
const report = (findings: LintFinding[]): LintReport => ({ scenes: ["scene.html"], samples: { "scene.html": [1.5] }, findings, unableToAssess: [] });

describe("lint findings", () => {
  test("a safe-zone crossing becomes a measured, deterministic finding at t × fps", () => {
    expect(findingDraftFromLint(crossing, fixtureManifest(), tiktok, "0.1.0")).toMatchObject({
      frame: 45, severity: "blocker", rule_id: "TYPO-SAFE", kind: "measured", severity_basis: "platform_rule",
      confidence: { value: 1, basis: "deterministic" }, evidence: { value: 1010, threshold: 960 }, selector: "#headline",
    });
  });

  test("an unverified preset caps at major, and a heuristic preset alone at minor", () => {
    expect(findingDraftFromLint({ ...crossing, verified: false }, fixtureManifest(), { ...tiktok, verified: false }, "0.1.0").severity).toBe("major");
    expect(findingDraftFromLint(crossing, fixtureManifest(), { ...tiktok, tier: "heuristic" }, "0.1.0")).toMatchObject({ severity: "minor", severity_basis: "heuristic_rule" });
  });

  test("lint rules without a pillar rule carry no rule_id and stay measured", () => {
    expect(findingDraftFromLint({ ...crossing, rule: "overflow" }, fixtureManifest(), tiktok, "0.1.0")).toMatchObject({ severity: "major", severity_basis: "measured_rule", evidence: { metric: "lint:overflow px" } });
    expect(findingDraftFromLint({ ...crossing, rule: "overflow" }, fixtureManifest(), tiktok, "0.1.0")).not.toHaveProperty("rule_id");
  });

  test("filing is idempotent and the result validates", () => {
    const { root, videoDirectory } = createFixtureWorkspace();
    writeRetainedManifest(videoDirectory);
    const lintReport = report([crossing, { ...crossing, rule: "overflow", selector: ".card" }]);
    const first = writeLintFindings(videoDirectory, root, lintReport, fixtureManifest(), tiktok, "0.1.0", new Date());
    expect(first).toMatchObject({ created: ["F-0001", "F-0002"], unchanged: [], skipped: [] });
    expect(writeLintFindings(videoDirectory, root, lintReport, fixtureManifest(), tiktok, "0.1.0", new Date())).toMatchObject({ created: [], unchanged: ["F-0001", "F-0002"] });
    expect(validateWorkspace(harnessRoot(), root).diagnostics).toEqual([]);
  });
});
