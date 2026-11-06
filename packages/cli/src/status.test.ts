import { describe, expect, test } from "vitest";
import { addFinding } from "./findings.js";
import { briefStatus, formatBriefStatus } from "./status.js";
import { ensureVideo } from "./video.js";
import { createFixtureWorkspace, writeRetainedManifest } from "./test-workspace.js";

describe("vcr status --brief", () => {
  test("lists videos needing review first, with open-finding counts", () => {
    const { root, videoDirectory } = createFixtureWorkspace();
    writeRetainedManifest(videoDirectory);
    addFinding(videoDirectory, root, { frame: 3, severity: "blocker", text: "Clipped.", author: { kind: "agent" }, source: "cli" }, new Date());
    ensureVideo(root, "demo/a-draft");
    const status = briefStatus(root, "0.1.0");
    expect(status.videos.map((video) => [video.video_id, video.state, video.open.blocker])).toEqual([["demo/teaser", "in_review", 1], ["demo/a-draft", "draft", 0]]);
    expect(formatBriefStatus(status)).toContain("demo/teaser  in_review  open 1 blocker");
  });

  test("stays under 1 KB with many videos", () => {
    const { root } = createFixtureWorkspace();
    for (let index = 0; index < 40; index += 1) ensureVideo(root, `project-with-a-long-name-${index}/video-with-a-long-name`);
    const status = briefStatus(root, "0.1.0");
    expect(Buffer.byteLength(formatBriefStatus(status))).toBeLessThan(1024);
    expect(Buffer.byteLength(JSON.stringify(status))).toBeLessThan(2048);
    expect(formatBriefStatus(status)).toContain("more; vcr findings list");
  });

  test("says when there is no workspace", () => {
    expect(formatBriefStatus(briefStatus(null, "0.1.0"))).toContain("no workspace");
  });
});
