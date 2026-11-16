import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import type { CaptureReport } from "@vcr/capture";
import { renderIdFor, stagingDirectoryFor, writeRender } from "./render-manifest.js";
import { readVideoReview, sha256Hex } from "./review.js";
import { renderReviewSummary, reviewSummaryDiagnostics, writeReviewSummary } from "./review-summary.js";
import { validateWorkspace } from "./validate.js";
import { createFixtureWorkspace, fixtureFinding, FIXTURE_RENDER_ID, FIXTURE_VIDEO_ID, harnessRoot, writeApproval, writeFinding, writeRetainedManifest } from "./test-workspace.js";

const createdAt = new Date("2026-11-06T12:34:56.789Z");

function stagedCapture(root: string): { staging: string; report: CaptureReport } {
  const staging = stagingDirectoryFor(root, FIXTURE_VIDEO_ID, createdAt);
  mkdirSync(join(staging, "frames"), { recursive: true });
  const report: CaptureReport = { width: 1080, height: 1920, fps: 30, duration_s: 0.1, frames: 3, wall_ms: 10, frames_per_second: 300, hashes: ["a", "b", "c"].map((letter) => letter.repeat(64)), shuffled_matches_sequential: null, mismatched_frames: [] };
  writeFileSync(join(staging, "report.json"), JSON.stringify(report));
  return { staging, report };
}

describe("writeRender", () => {
  test("render ids carry the UTC second and the frame content hash", () => {
    expect(renderIdFor(createdAt, "abcdef0123")).toBe("r-20261106T123456-abcdef0");
  });

  test("moves the capture to its render directory and retains an identical, valid manifest", () => {
    const { root, videoDirectory } = createFixtureWorkspace();
    const { staging, report } = stagedCapture(root);
    const written = writeRender({ workspaceRoot: root, videoId: FIXTURE_VIDEO_ID, videoDirectory, sceneFile: "/somewhere/Title Card.html", stagingDirectory: staging, report, createdAt });

    expect(written.manifest).toMatchObject({ render_id: renderIdFor(createdAt, sha256Hex(report.hashes.join("\n"))), duration_frames: 3, scenes: [{ id: "title-card", start_frame: 0, end_frame: 2 }] });
    expect(existsSync(staging)).toBe(false);
    expect(existsSync(join(written.renderDirectory, "frames"))).toBe(true);
    const retained = readFileSync(written.retainedManifestPath, "utf8");
    expect(retained).toBe(readFileSync(join(written.renderDirectory, "manifest.json"), "utf8"));
    expect(sha256Hex(retained)).toBe(written.manifestSha256);
    expect(written.reviewSummary).toBe("updated");
    expect(readFileSync(join(videoDirectory, "review/REVIEW.md"), "utf8")).toContain(written.manifest.render_id);
    expect(written.manifest.outputs.map((output) => output.path)).toEqual([`output/demo/teaser/${written.manifest.render_id}/frames`, `output/demo/teaser/${written.manifest.render_id}/report.json`]);
    expect(validateWorkspace(harnessRoot(), root).diagnostics).toEqual([]);
  });

  test("refreshes a current summary after a new render without changing findings or human decisions", () => {
    const { root, videoDirectory } = createFixtureWorkspace();
    const manifestSha256 = writeRetainedManifest(videoDirectory);
    writeFinding(videoDirectory, fixtureFinding());
    writeApproval(videoDirectory, { schema_version: "1.0.0", render_id: FIXTURE_RENDER_ID, manifest_sha256: manifestSha256, decision: "changes_requested", channel: "tty", at: "2026-11-06T12:02:00.000Z" });
    const previous = readVideoReview(videoDirectory, root);
    writeReviewSummary(videoDirectory, FIXTURE_VIDEO_ID, previous);
    const findings = readFileSync(join(videoDirectory, "review/findings/F-0001.json"), "utf8");
    const approval = readFileSync(join(videoDirectory, "review/approvals", `${FIXTURE_RENDER_ID}.json`), "utf8");
    const { staging, report } = stagedCapture(root);
    const written = writeRender({ workspaceRoot: root, videoId: FIXTURE_VIDEO_ID, videoDirectory, sceneFile: "/scene.html", stagingDirectory: staging, report, createdAt });
    const review = readVideoReview(videoDirectory, root);
    expect(written.reviewSummary).toBe("updated");
    expect(reviewSummaryDiagnostics(videoDirectory, FIXTURE_VIDEO_ID, review, "REVIEW.md")).toEqual([]);
    const summary = readFileSync(join(videoDirectory, "review/REVIEW.md"), "utf8");
    expect(summary).toBe(renderReviewSummary(FIXTURE_VIDEO_ID, review));
    expect(summary).toContain("changes_requested (tty");
    expect(summary).toContain(`${written.manifest.render_id}: 1080×1920 @ 30 fps, 3 frames; no decision`);
    expect(readFileSync(join(videoDirectory, "review/findings/F-0001.json"), "utf8")).toBe(findings);
    expect(readFileSync(join(videoDirectory, "review/approvals", `${FIXTURE_RENDER_ID}.json`), "utf8")).toBe(approval);
  });

  test.each(["# hand edited\n", "stale generated summary\n"])("preserves pre-existing summary drift: %s", (content) => {
    const { root, videoDirectory } = createFixtureWorkspace();
    writeRetainedManifest(videoDirectory);
    writeFileSync(join(videoDirectory, "review/REVIEW.md"), content);
    const { staging, report } = stagedCapture(root);
    const written = writeRender({ workspaceRoot: root, videoId: FIXTURE_VIDEO_ID, videoDirectory, sceneFile: "/scene.html", stagingDirectory: staging, report, createdAt });
    expect(written.reviewSummary).toBe("preserved");
    expect(existsSync(written.retainedManifestPath)).toBe(true);
    expect(readFileSync(join(videoDirectory, "review/REVIEW.md"), "utf8")).toBe(content);
    expect(reviewSummaryDiagnostics(videoDirectory, FIXTURE_VIDEO_ID, readVideoReview(videoDirectory, root), "REVIEW.md")).toEqual([expect.objectContaining({ suggestion: expect.stringContaining("preserves existing drift") })]);
  });

  test("does not refresh the summary when retaining a staged capture fails", () => {
    const { root, videoDirectory } = createFixtureWorkspace();
    writeRetainedManifest(videoDirectory);
    writeReviewSummary(videoDirectory, FIXTURE_VIDEO_ID, readVideoReview(videoDirectory, root));
    const before = readFileSync(join(videoDirectory, "review/REVIEW.md"), "utf8");
    const { report } = stagedCapture(root);
    expect(() => writeRender({ workspaceRoot: root, videoId: FIXTURE_VIDEO_ID, videoDirectory, sceneFile: "/scene.html", stagingDirectory: join(root, "missing"), report, createdAt })).toThrow();
    expect(readFileSync(join(videoDirectory, "review/REVIEW.md"), "utf8")).toBe(before);
    expect(readVideoReview(videoDirectory, root).manifests).toHaveLength(1);
  });
});
