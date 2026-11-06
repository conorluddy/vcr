import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { validateWorkspace } from "./validate.js";
import { ensureVideo, listVideoDirectories, resolveVideo } from "./video.js";
import { ensureWorkspace } from "./workspace.js";
import { harnessRoot } from "./test-workspace.js";

function emptyWorkspace(): string {
  const root = mkdtempSync(join(tmpdir(), "vcr-video-"));
  ensureWorkspace(root, "0.1.0");
  return root;
}

describe("ensureVideo", () => {
  test("registers the project and video once, then changes nothing", () => {
    const root = emptyWorkspace();
    const first = ensureVideo(root, "demo/teaser");
    expect(first.ok && first.value.changes).toEqual(["vcr.json", "projects/demo/project.json", "projects/demo/videos/teaser/review/renders/", "projects/demo/videos/teaser/review/findings/", "projects/demo/videos/teaser/review/approvals/"]);
    const second = ensureVideo(root, "demo/teaser");
    expect(second.ok && second.value.changes).toEqual([]);
    expect(JSON.parse(readFileSync(join(root, "vcr.json"), "utf8")).projects).toEqual(["demo"]);
    expect(validateWorkspace(harnessRoot(), root).diagnostics).toEqual([]);
  });

  test("adds a second video to an existing project without touching its other fields", () => {
    const root = emptyWorkspace();
    ensureVideo(root, "demo/teaser");
    const projectPath = join(root, "projects/demo/project.json");
    writeFileSync(projectPath, JSON.stringify({ ...JSON.parse(readFileSync(projectPath, "utf8")), title: "Kept" }));
    ensureVideo(root, "demo/cutdown");
    expect(JSON.parse(readFileSync(projectPath, "utf8"))).toMatchObject({ title: "Kept", videos: ["cutdown", "teaser"] });
    expect(listVideoDirectories(root).map((video) => video.videoId)).toEqual(["demo/cutdown", "demo/teaser"]);
  });

  test.each(["teaser", "Demo/Teaser", "demo/teaser/extra", "../x/y"])("rejects the malformed id %s", (videoId) => {
    expect(ensureVideo(emptyWorkspace(), videoId)).toMatchObject({ ok: false, error: { code: "INVALID_ARGUMENT" } });
  });
});

describe("resolveVideo", () => {
  test("names the videos that exist when the id is unknown", () => {
    const root = emptyWorkspace();
    ensureVideo(root, "demo/teaser");
    const outcome = resolveVideo(root, "demo/missing");
    expect(outcome).toMatchObject({ ok: false, error: { code: "VIDEO_NOT_FOUND", message: expect.stringContaining("demo/teaser") } });
  });
});
