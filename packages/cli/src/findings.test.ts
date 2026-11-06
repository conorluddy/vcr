import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { addFinding, addressFinding, closeFinding, type FindingDraft } from "./findings.js";
import { validateWorkspace } from "./validate.js";
import { createFixtureWorkspace, fixtureManifest, FIXTURE_RENDER_ID, harnessRoot, writeRetainedManifest } from "./test-workspace.js";

const now = new Date("2026-11-06T12:00:00.000Z");
const draft: FindingDraft = { frame: 50, severity: "major", text: "Headline crosses the safe zone.", author: { kind: "agent" }, source: "cli", rule_id: "TYPO-SAFE" };

function twoSceneVideo() {
  const fixture = createFixtureWorkspace();
  writeRetainedManifest(fixture.videoDirectory, fixtureManifest({ scenes: [{ id: "intro", start_frame: 0, end_frame: 29, frames_dir: "f" }, { id: "title", start_frame: 30, end_frame: 89, frames_dir: "f" }] }));
  return fixture;
}

describe("addFinding", () => {
  test("derives scene and scene frame from the latest render and validates", () => {
    const { root, videoDirectory } = twoSceneVideo();
    const outcome = addFinding(videoDirectory, root, draft, now);
    expect(outcome).toMatchObject({ ok: true, value: { isCreated: true, finding: { id: "F-0001", render_id: FIXTURE_RENDER_ID, scene_id: "title", scene_frame: 20, status: "open" } } });
    expect(validateWorkspace(harnessRoot(), root).diagnostics).toEqual([]);
  });

  test("the same note twice is written once", () => {
    const { root, videoDirectory } = twoSceneVideo();
    addFinding(videoDirectory, root, draft, now);
    expect(addFinding(videoDirectory, root, draft, new Date())).toMatchObject({ ok: true, value: { isCreated: false, finding: { id: "F-0001" } } });
    expect(addFinding(videoDirectory, root, { ...draft, frame: 51 }, now)).toMatchObject({ ok: true, value: { finding: { id: "F-0002" } } });
  });

  test("never overwrites an id another writer took first", () => {
    const { root, videoDirectory } = twoSceneVideo();
    addFinding(videoDirectory, root, draft, now);
    // Another writer claims F-0002 as an unparsable partial; the next add must skip it, not clobber it.
    writeFileSync(join(videoDirectory, "review/findings/F-0002.json"), "{");
    expect(addFinding(videoDirectory, root, { ...draft, frame: 10 }, now)).toMatchObject({ ok: true, value: { finding: { id: "F-0003", scene_id: "intro" } } });
    expect(readFileSync(join(videoDirectory, "review/findings/F-0002.json"), "utf8")).toBe("{");
  });

  test("refuses a frame outside the render and a missing render", () => {
    const { root, videoDirectory } = twoSceneVideo();
    expect(addFinding(videoDirectory, root, { ...draft, frame: 500 }, now)).toMatchObject({ ok: false, error: { code: "INVALID_ARGUMENT" } });
    expect(addFinding(createFixtureWorkspace().videoDirectory, root, draft, now)).toMatchObject({ ok: false, error: { code: "RENDER_NOT_FOUND" } });
  });
});

describe("addressFinding", () => {
  test("an agent claims a fix, idempotently, and the result validates", () => {
    const { root, videoDirectory } = twoSceneVideo();
    addFinding(videoDirectory, root, draft, now);
    const resolution = { render_id: FIXTURE_RENDER_ID, note: "Moved the headline in", evidence: ["after.png"] };
    expect(addressFinding(videoDirectory, root, "F-0001", resolution, now)).toMatchObject({ ok: true, value: { isCreated: true, finding: { status: "addressed" } } });
    expect(addressFinding(videoDirectory, root, "F-0001", resolution, now)).toMatchObject({ ok: true, value: { isCreated: false } });
    expect(validateWorkspace(harnessRoot(), root).diagnostics).toEqual([]);
  });

  test("a closed finding cannot be addressed", () => {
    const { root, videoDirectory } = twoSceneVideo();
    addFinding(videoDirectory, root, draft, now);
    closeFinding(videoDirectory, root, "F-0001", "wontfix", "tty", undefined, now);
    expect(addressFinding(videoDirectory, root, "F-0001", { render_id: FIXTURE_RENDER_ID, note: "x", evidence: [] }, now)).toMatchObject({ ok: false, error: { code: "FINDING_CLOSED" } });
  });
});
