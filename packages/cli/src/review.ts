import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { listJsonFiles, readJsonFile } from "./repository.js";
import type { Diagnostic } from "./validate.js";

// The review data contract (plugin PRD §6.4): per video, retained render manifests, one file per
// finding and one approval per render, all under <video>/review/. Schemas live in catalog/schemas/.

// === TYPES ===

export interface ManifestScene {
  id: string;
  start_frame: number;
  end_frame: number;
  frames_dir: string;
}

export interface RenderManifest {
  schema_version: string;
  render_id: string;
  video_id: string;
  fps: number;
  width: number;
  height: number;
  duration_frames: number;
  scenes: ManifestScene[];
  outputs: Array<{ kind: "frames" | "video" | "audio" | "report"; path: string; sha256: string }>;
  frame_sha256?: string[];
  created_at: string;
  environment: { hostname: string; platform: string; node: string; capture_mode?: string; tools?: Record<string, string> };
}

export type Severity = "blocker" | "major" | "minor" | "note";
export type FindingStatus = "open" | "addressed" | "resolved" | "wontfix";
export type HumanChannel = "review" | "tty";

export interface Finding {
  schema_version: string;
  id: string;
  render_id: string;
  scene_id: string;
  frame: number;
  scene_frame: number;
  region?: { x: number; y: number; w: number; h: number };
  severity: Severity;
  text: string;
  author: { kind: "human" | "agent"; name?: string };
  source: "review" | "cli" | "chat" | "share";
  status: FindingStatus;
  created_at: string;
  resolution?: { render_id: string; note: string; evidence: string[]; at?: string };
  closure?: { channel: HumanChannel; at: string; note?: string };
  frame_end?: number;
  selector?: string;
  rule_id?: string;
  kind?: "measured" | "judged" | "hybrid";
  severity_basis?: "measured_rule" | "brief_clause" | "standard_rule" | "platform_rule" | "heuristic_rule" | "taste";
  brief_ref?: string;
  confidence?: { value: number; basis: "deterministic" | "multi_sample_agreement" | "single_judgement" | "inferred_from_stills" };
  evidence?: { metric?: string; value?: unknown; threshold?: unknown; artifacts?: string[] };
  reviewer?: { agent: string; model?: string; rules_version?: string };
}

export interface Approval {
  schema_version: string;
  render_id: string;
  decision: "approved" | "changes_requested";
  manifest_sha256: string;
  channel: HumanChannel;
  at: string;
  note?: string;
}

/** Schema-valid documents of one video's review directory, with workspace-relative file names for diagnostics. */
export interface VideoReview {
  manifests: Array<{ manifest: RenderManifest; sha256: string; file: string }>;
  findings: Array<{ finding: Finding; file: string }>;
  approvals: Array<{ approval: Approval; file: string }>;
}

// === PUBLIC API ===

export const REVIEW_PATHS = {
  directory: "review",
  renders: "review/renders",
  findings: "review/findings",
  approvals: "review/approvals",
  manifestFile: "manifest.json",
} as const;

export function sha256Hex(content: string | Buffer): string {
  return createHash("sha256").update(content).digest("hex");
}

/** Retained render ids under <video>/review/renders/ that hold a manifest. */
export function listRetainedRenderIds(videoDirectory: string): string[] {
  const rendersDirectory = join(videoDirectory, REVIEW_PATHS.renders);
  if (!existsSync(rendersDirectory)) return [];
  return readdirSync(rendersDirectory).filter((entry) => existsSync(join(rendersDirectory, entry, REVIEW_PATHS.manifestFile))).sort();
}

/**
 * Cross-file rules the schemas cannot express (RV-02, RV-04): an approval must name the hash of a
 * retained manifest, a closed finding must record a human channel, and a finding's frames must sit
 * inside the render it points at. A guardrail against accidental self-approval, not a security boundary.
 */
export function reviewDiagnostics(review: VideoReview): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const manifestsById = new Map(review.manifests.map((entry) => [entry.manifest.render_id, entry]));
  for (const { manifest, file } of review.manifests) {
    if (!file.endsWith(`/${manifest.render_id}/${REVIEW_PATHS.manifestFile}`)) diagnostics.push(error(file, "/render_id", `render_id ${manifest.render_id} does not match its directory`, "Keep each manifest at review/renders/<render_id>/manifest.json."));
  }
  for (const { approval, file } of review.approvals) {
    if (!file.endsWith(`/${approval.render_id}.json`)) diagnostics.push(error(file, "/render_id", `render_id ${approval.render_id} does not match the file name`, "Name the file review/approvals/<render_id>.json."));
    const retained = manifestsById.get(approval.render_id);
    if (!retained) diagnostics.push(error(file, "/render_id", `no retained render ${approval.render_id}`, "Approve a render whose manifest is in review/renders/; an approval of an unretained render is not evidence."));
    else if (retained.sha256 !== approval.manifest_sha256) diagnostics.push(error(file, "/manifest_sha256", `manifest_sha256 does not match review/renders/${approval.render_id}/manifest.json`, "The render changed after the decision, or the approval was not written by `vcr review`; decide again through a human channel."));
  }
  for (const { finding, file } of review.findings) diagnostics.push(...findingDiagnostics(finding, file, manifestsById.get(finding.render_id)?.manifest));
  return diagnostics;
}

/**
 * Reads one video's review directory without schema checks, skipping unparsable files: what the
 * CLI acts on. `vcr validate` is what reports malformed files.
 */
export function readVideoReview(videoDirectory: string, workspaceRoot: string): VideoReview {
  const review: VideoReview = { manifests: [], findings: [], approvals: [] };
  for (const renderId of listRetainedRenderIds(videoDirectory)) {
    const path = join(videoDirectory, REVIEW_PATHS.renders, renderId, REVIEW_PATHS.manifestFile);
    const content = readFileSync(path);
    const parsed = readJsonFile<RenderManifest>(path);
    if (parsed.ok) review.manifests.push({ manifest: parsed.value, sha256: sha256Hex(content), file: relative(workspaceRoot, path) });
  }
  for (const path of listJsonFiles(join(videoDirectory, REVIEW_PATHS.findings))) {
    const parsed = readJsonFile<Finding>(path);
    if (parsed.ok) review.findings.push({ finding: parsed.value, file: relative(workspaceRoot, path) });
  }
  for (const path of listJsonFiles(join(videoDirectory, REVIEW_PATHS.approvals))) {
    const parsed = readJsonFile<Approval>(path);
    if (parsed.ok) review.approvals.push({ approval: parsed.value, file: relative(workspaceRoot, path) });
  }
  return review;
}

/** Render ids sort by their UTC timestamp, so the last retained manifest is the latest render. */
export function latestManifest(review: VideoReview): RenderManifest | undefined {
  return [...review.manifests].sort((left, right) => left.manifest.render_id.localeCompare(right.manifest.render_id)).at(-1)?.manifest;
}

export type VideoState = "draft" | "in_review" | "changes_requested" | "approved";

/** PRD §6.3 states, decided by the latest render: no render is a draft, and a decision on an older render no longer counts. */
export function videoState(review: VideoReview): VideoState {
  const latest = latestManifest(review);
  if (!latest) return "draft";
  const decision = review.approvals.find((entry) => entry.approval.render_id === latest.render_id)?.approval.decision;
  return decision ?? "in_review";
}

/** The scene containing a composition frame, or undefined when it falls outside every scene. */
export function sceneForFrame(manifest: RenderManifest, frame: number): ManifestScene | undefined {
  return manifest.scenes.find((scene) => frame >= scene.start_frame && frame <= scene.end_frame);
}

// === PRIVATE HELPERS ===

function findingDiagnostics(finding: Finding, file: string, manifest: RenderManifest | undefined): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  if (!file.endsWith(`/${finding.id}.json`)) diagnostics.push(error(file, "/id", `id ${finding.id} does not match the file name`, "Name the file review/findings/<id>.json."));
  const isClosed = finding.status === "resolved" || finding.status === "wontfix";
  if (isClosed && !finding.closure) diagnostics.push(error(file, "/status", `${finding.status} without a human channel`, "Only a human closes a finding, through the review page or `vcr review resolve` at a terminal; set status back to addressed."));
  if (!isClosed && finding.closure) diagnostics.push(error(file, "/closure", `closure recorded but status is ${finding.status}`, "Remove closure, or set the status the human chose."));
  if (finding.frame_end !== undefined && finding.frame_end < finding.frame) diagnostics.push(error(file, "/frame_end", `frame_end ${finding.frame_end} is before frame ${finding.frame}`, "frame_end is inclusive and must be at or after frame."));
  if (!manifest) {
    diagnostics.push(error(file, "/render_id", `no retained render ${finding.render_id}`, "Point the finding at a render in review/renders/."));
    return diagnostics;
  }
  const scene = manifest.scenes.find((candidate) => candidate.id === finding.scene_id);
  if (!scene) diagnostics.push(error(file, "/scene_id", `scene ${finding.scene_id} is not in render ${finding.render_id}`, `Use one of: ${manifest.scenes.map((candidate) => candidate.id).join(", ")}.`));
  else if (finding.frame < scene.start_frame || finding.frame > scene.end_frame) diagnostics.push(error(file, "/frame", `frame ${finding.frame} is outside scene ${scene.id} (${scene.start_frame}–${scene.end_frame})`, "frame is the composition frame; check the scene."));
  else if (finding.scene_frame !== finding.frame - scene.start_frame) diagnostics.push(error(file, "/scene_frame", `scene_frame ${finding.scene_frame} should be ${finding.frame - scene.start_frame}`, "scene_frame is derived from the manifest; let `vcr findings add` compute it."));
  return diagnostics;
}

function error(file: string, path: string, message: string, suggestion: string): Diagnostic {
  return { severity: "error", file, path, message, suggestion };
}
