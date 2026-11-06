import { existsSync, readFileSync, renameSync, rmSync } from "node:fs";
import { hostname, platform } from "node:os";
import { basename, extname, join, relative } from "node:path";
import type { CaptureReport } from "@vcr/capture";
import type { EnvironmentRecord } from "./doctor.js";
import { writeFileAtomic } from "./repository.js";
import { REVIEW_PATHS, sha256Hex, type RenderManifest } from "./review.js";

// `vcr capture --video` turns a capture into a render: frames under output/<video>/<render_id>/,
// a manifest beside them, and a retained copy under review/renders/<render_id>/ (plugin PRD §6.4).

// === TYPES ===

export interface RenderInputs {
  workspaceRoot: string;
  videoId: string;
  videoDirectory: string;
  sceneFile: string;
  /** Where the capture wrote frames/ and report.json; renamed to the render directory. */
  stagingDirectory: string;
  report: CaptureReport;
  createdAt: Date;
  machineRecord?: EnvironmentRecord | undefined;
}

export interface WrittenRender {
  manifest: RenderManifest;
  renderDirectory: string;
  retainedManifestPath: string;
  manifestSha256: string;
}

// === PUBLIC API ===

/** Staging directory for a capture whose render_id is not known until its frames are hashed. */
export function stagingDirectoryFor(workspaceRoot: string, videoId: string, now: Date): string {
  return join(renderOutputRoot(workspaceRoot, videoId), `.capturing-${now.getTime()}`);
}

/** `r-<UTC yyyymmddThhmmss>-<first 7 hex of the frame content hash>`. */
export function renderIdFor(createdAt: Date, contentSha256: string): string {
  const stamp = createdAt.toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "");
  return `r-${stamp}-${contentSha256.slice(0, 7)}`;
}

/** Moves the staged capture to output/<video>/<render_id>/ and writes the manifest there and in review/renders/. */
export function writeRender(inputs: RenderInputs): WrittenRender {
  const contentSha256 = sha256Hex(inputs.report.hashes.join("\n"));
  const renderId = renderIdFor(inputs.createdAt, contentSha256);
  const renderDirectory = join(renderOutputRoot(inputs.workspaceRoot, inputs.videoId), renderId);
  // Same pixels in the same second: the earlier render is identical, so replace it rather than fail.
  if (existsSync(renderDirectory)) rmSync(renderDirectory, { recursive: true, force: true });
  renameSync(inputs.stagingDirectory, renderDirectory);

  const toWorkspace = (path: string) => relative(inputs.workspaceRoot, path);
  const framesDirectory = toWorkspace(join(renderDirectory, "frames"));
  const reportPath = join(renderDirectory, "report.json");
  const manifest: RenderManifest = {
    schema_version: "1.0.0",
    render_id: renderId,
    video_id: inputs.videoId,
    fps: inputs.report.fps,
    width: inputs.report.width,
    height: inputs.report.height,
    duration_frames: inputs.report.frames,
    scenes: [{ id: sceneIdFor(inputs.sceneFile), start_frame: 0, end_frame: inputs.report.frames - 1, frames_dir: framesDirectory }],
    outputs: [
      { kind: "frames", path: framesDirectory, sha256: contentSha256 },
      { kind: "report", path: toWorkspace(reportPath), sha256: sha256Hex(readFileSync(reportPath)) },
    ],
    frame_sha256: inputs.report.hashes,
    created_at: inputs.createdAt.toISOString(),
    environment: environmentFor(inputs.machineRecord),
  };
  const content = `${JSON.stringify(manifest, null, 2)}\n`;
  writeFileAtomic(join(renderDirectory, REVIEW_PATHS.manifestFile), content);
  const retainedManifestPath = join(inputs.videoDirectory, REVIEW_PATHS.renders, renderId, REVIEW_PATHS.manifestFile);
  writeFileAtomic(retainedManifestPath, content);
  return { manifest, renderDirectory, retainedManifestPath, manifestSha256: sha256Hex(content) };
}

// === PRIVATE HELPERS ===

function renderOutputRoot(workspaceRoot: string, videoId: string): string {
  return join(workspaceRoot, "output", ...videoId.split("/"));
}

/** One scene per capture until the scene contract names scenes (#143): the file name, slugged. */
function sceneIdFor(sceneFile: string): string {
  return basename(sceneFile, extname(sceneFile)).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "scene";
}

/** Read from the machine's last `vcr doctor` record rather than probing every tool on each capture. */
function environmentFor(machineRecord: EnvironmentRecord | undefined): RenderManifest["environment"] {
  const tools = Object.fromEntries((machineRecord?.tools ?? []).filter((tool) => tool.version !== null).map((tool) => [tool.tool_id, tool.version!]));
  return {
    hostname: hostname(),
    platform: platform(),
    node: process.version,
    capture_mode: process.env["VCR_CAPTURE_MODE"] ?? "screenshot",
    ...(Object.keys(tools).length > 0 ? { tools } : {}),
  };
}
