import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { runFindingsCommand } from "./review-commands.js";
import { validateWorkspace } from "./validate.js";
import { createFixtureWorkspace, FIXTURE_VIDEO_ID, harnessRoot, writeRetainedManifest } from "./test-workspace.js";

describe("REVIEW.md", () => {
  test("is regenerated on each write, and a hand edit is flagged as stale", () => {
    const { root, videoDirectory } = createFixtureWorkspace();
    writeRetainedManifest(videoDirectory);
    const outcome = runFindingsCommand(root, "add", FIXTURE_VIDEO_ID, undefined, { frame: "12", severity: "blocker", text: "Caption clipped." }, new Date("2026-11-06T12:00:00.000Z"));
    expect(outcome).toMatchObject({ ok: true, value: { json: { summaryUpdated: true } } });
    expect(validateWorkspace(harnessRoot(), root).diagnostics).toEqual([]);
    writeFileSync(join(videoDirectory, "review/REVIEW.md"), "# edited by hand\n");
    expect(validateWorkspace(harnessRoot(), root).diagnostics).toEqual([expect.objectContaining({ severity: "warning", message: expect.stringContaining("stale") })]);
  });
});
