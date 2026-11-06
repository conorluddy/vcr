import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { resolveRoots } from "./roots.js";
import { sha256Hex, type Approval, type Finding, type RenderManifest } from "./review.js";

// Test support only: temp-directory workspaces holding one video with a retained render.

export const FIXTURE_VIDEO_ID = "demo/teaser";
export const FIXTURE_RENDER_ID = "r-20261106T120000-abcdef0";

export function harnessRoot(): string {
  const roots = resolveRoots({ cwd: process.cwd(), env: {} });
  if (!roots.ok) throw new Error(roots.error.message);
  return roots.value.harness;
}

/** A workspace with vcr.json and demo/teaser registered, nothing else. */
export function createFixtureWorkspace(): { root: string; videoDirectory: string } {
  const root = mkdtempSync(join(tmpdir(), "vcr-fixture-"));
  writeJson(join(root, "vcr.json"), { schema_version: "1.0.0", harness_version: "0.1.0", projects: ["demo"] });
  writeJson(join(root, "projects/demo/project.json"), { schema_version: "1.0.0", id: "demo", title: "Demo", reuse_scope: "private", dependency_policy: "unpinned", assets_manifest: "assets.json", videos: ["teaser"] });
  const videoDirectory = join(root, "projects/demo/videos/teaser");
  mkdirSync(videoDirectory, { recursive: true });
  return { root, videoDirectory };
}

export function fixtureManifest(overrides: Partial<RenderManifest> = {}): RenderManifest {
  return {
    schema_version: "1.0.0",
    render_id: FIXTURE_RENDER_ID,
    video_id: FIXTURE_VIDEO_ID,
    fps: 30,
    width: 1080,
    height: 1920,
    duration_frames: 90,
    scenes: [{ id: "title", start_frame: 0, end_frame: 89, frames_dir: "output/demo/teaser/r-20261106T120000-abcdef0/frames" }],
    outputs: [{ kind: "frames", path: "output/demo/teaser/r-20261106T120000-abcdef0/frames", sha256: "0".repeat(64) }],
    created_at: "2026-11-06T12:00:00.000Z",
    environment: { hostname: "fixture", platform: "darwin", node: "v22.0.0" },
    ...overrides,
  };
}

export function fixtureFinding(overrides: Partial<Finding> = {}): Finding {
  return {
    schema_version: "1.0.0",
    id: "F-0001",
    render_id: FIXTURE_RENDER_ID,
    scene_id: "title",
    frame: 45,
    scene_frame: 45,
    severity: "major",
    text: "Headline crosses the right safe-zone edge.",
    author: { kind: "agent", name: "vcr-lint" },
    source: "cli",
    status: "open",
    created_at: "2026-11-06T12:01:00.000Z",
    ...overrides,
  };
}

/** Writes a retained manifest and returns the sha256 an approval must name. */
export function writeRetainedManifest(videoDirectory: string, manifest: RenderManifest = fixtureManifest()): string {
  const content = `${JSON.stringify(manifest, null, 2)}\n`;
  writeText(join(videoDirectory, "review/renders", manifest.render_id, "manifest.json"), content);
  return sha256Hex(content);
}

export function writeFinding(videoDirectory: string, finding: Finding): void {
  writeJson(join(videoDirectory, "review/findings", `${finding.id}.json`), finding);
}

export function writeApproval(videoDirectory: string, approval: Approval): void {
  writeJson(join(videoDirectory, "review/approvals", `${approval.render_id}.json`), approval);
}

export function writeJson(path: string, value: unknown): void {
  writeText(path, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}
