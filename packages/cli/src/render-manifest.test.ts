import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import type { CaptureReport } from "@vcr/capture";
import { renderIdFor, stagingDirectoryFor, writeRender } from "./render-manifest.js";
import { sha256Hex } from "./review.js";
import { validateWorkspace } from "./validate.js";
import { createFixtureWorkspace, FIXTURE_VIDEO_ID, harnessRoot } from "./test-workspace.js";

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
    expect(written.manifest.outputs.map((output) => output.path)).toEqual([`output/demo/teaser/${written.manifest.render_id}/frames`, `output/demo/teaser/${written.manifest.render_id}/report.json`]);
    expect(validateWorkspace(harnessRoot(), root).diagnostics).toEqual([]);
  });
});
