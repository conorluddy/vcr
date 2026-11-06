import { describe, expect, test } from "vitest";
import { hasErrors, validateWorkspace } from "./validate.js";
import { createFixtureWorkspace, fixtureFinding, FIXTURE_RENDER_ID, harnessRoot, writeApproval, writeFinding, writeRetainedManifest } from "./test-workspace.js";
import type { Finding } from "./review.js";

function errorsFor(root: string): string[] {
  return validateWorkspace(harnessRoot(), root).diagnostics.filter((diagnostic) => diagnostic.severity === "error").map((diagnostic) => `${diagnostic.path}: ${diagnostic.message}`);
}

function workspaceWithFinding(overrides: Partial<Finding>): string {
  const { root, videoDirectory } = createFixtureWorkspace();
  writeRetainedManifest(videoDirectory);
  writeFinding(videoDirectory, fixtureFinding(overrides));
  return root;
}

describe("review contract validation", () => {
  test("a retained render with a finding and a matching approval passes", () => {
    const { root, videoDirectory } = createFixtureWorkspace();
    const manifestSha256 = writeRetainedManifest(videoDirectory);
    writeFinding(videoDirectory, fixtureFinding());
    writeApproval(videoDirectory, { schema_version: "1.0.0", render_id: FIXTURE_RENDER_ID, decision: "approved", manifest_sha256: manifestSha256, channel: "tty", at: "2026-11-06T13:00:00.000Z" });
    expect(errorsFor(root)).toEqual([]);
  });

  test("an approval whose hash matches no retained manifest is rejected", () => {
    const { root, videoDirectory } = createFixtureWorkspace();
    writeRetainedManifest(videoDirectory);
    writeApproval(videoDirectory, { schema_version: "1.0.0", render_id: FIXTURE_RENDER_ID, decision: "approved", manifest_sha256: "f".repeat(64), channel: "tty", at: "2026-11-06T13:00:00.000Z" });
    expect(errorsFor(root)).toEqual([expect.stringContaining("manifest_sha256 does not match")]);
  });

  test("an approval of a render that was never retained is rejected", () => {
    const { root, videoDirectory } = createFixtureWorkspace();
    writeApproval(videoDirectory, { schema_version: "1.0.0", render_id: FIXTURE_RENDER_ID, decision: "approved", manifest_sha256: "f".repeat(64), channel: "tty", at: "2026-11-06T13:00:00.000Z" });
    expect(errorsFor(root)).toEqual([expect.stringContaining("no retained render")]);
  });

  test("a resolved finding without a human channel is rejected", () => {
    expect(errorsFor(workspaceWithFinding({ status: "resolved" }))).toEqual([expect.stringContaining("without a human channel")]);
  });

  test("a resolved finding closed through a terminal passes", () => {
    expect(errorsFor(workspaceWithFinding({ status: "resolved", closure: { channel: "tty", at: "2026-11-06T13:00:00.000Z" } }))).toEqual([]);
  });

  test("an addressed finding must carry the claimed fix", () => {
    expect(hasErrors(validateWorkspace(harnessRoot(), workspaceWithFinding({ status: "addressed" })))).toBe(true);
  });

  test.each([
    ["taste above a note", { severity_basis: "taste", severity: "minor" }],
    ["a heuristic blocker", { severity_basis: "heuristic_rule", severity: "blocker" }],
    ["a heuristic major with no artifact", { severity_basis: "heuristic_rule", severity: "major", evidence: { metric: "hold_s", value: 0.4 } }],
    ["a judged blocker below 0.8 confidence", { kind: "judged", severity: "blocker", confidence: { value: 0.7, basis: "single_judgement" } }],
  ] as const)("severity caps reject %s", (_label, overrides) => {
    expect(hasErrors(validateWorkspace(harnessRoot(), workspaceWithFinding(overrides as Partial<Finding>)))).toBe(true);
  });

  test("a heuristic major with an artifact is within the caps", () => {
    expect(errorsFor(workspaceWithFinding({ severity_basis: "heuristic_rule", severity: "major", evidence: { artifacts: ["review/renders/x/f0045.png"] } }))).toEqual([]);
  });

  test("scene_frame must agree with the manifest", () => {
    expect(errorsFor(workspaceWithFinding({ frame: 45, scene_frame: 40 }))).toEqual([expect.stringContaining("scene_frame 40 should be 45")]);
  });

  test("a finding outside its scene is rejected", () => {
    expect(errorsFor(workspaceWithFinding({ frame: 120, scene_frame: 120 }))).toEqual([expect.stringContaining("outside scene title")]);
  });
});
