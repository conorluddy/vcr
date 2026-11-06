import { existsSync, linkSync, mkdirSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { writeJsonAtomic } from "./repository.js";
import { fail, ok, type Result } from "./result.types.js";
import { latestManifest, readVideoReview, REVIEW_PATHS, sceneForFrame, type Finding, type HumanChannel, type VideoReview } from "./review.js";

// Findings are one file each (PRD §6.4, RV-02, RV-05). Agents and checks add and address them;
// only a human channel closes them (closeFinding is called behind the TTY gate in approvals.ts).

// === TYPES ===

/** What a writer supplies; id, scene, scene_frame, status and created_at are derived. */
export type FindingDraft = Omit<Finding, "schema_version" | "id" | "render_id" | "scene_id" | "scene_frame" | "status" | "created_at" | "resolution" | "closure"> & { render_id?: string };

export interface FindingWrite {
  finding: Finding;
  /** False when an identical finding already existed and nothing was written. */
  isCreated: boolean;
}

export interface FindingFilter {
  status?: string | undefined;
  renderId?: string | undefined;
}

// === PUBLIC API ===

export function listFindings(review: VideoReview, filter: FindingFilter = {}): Finding[] {
  return review.findings
    .map((entry) => entry.finding)
    .filter((finding) => (!filter.status || finding.status === filter.status) && (!filter.renderId || finding.render_id === filter.renderId))
    .sort((left, right) => left.id.localeCompare(right.id));
}

/**
 * Adds a finding against a retained render (the latest when none is named), deriving scene_id and
 * scene_frame from its manifest. Idempotent on content: the same note twice returns the first.
 */
export function addFinding(videoDirectory: string, workspaceRoot: string, draft: FindingDraft, now: Date): Result<FindingWrite> {
  const review = readVideoReview(videoDirectory, workspaceRoot);
  const manifest = draft.render_id ? review.manifests.find((entry) => entry.manifest.render_id === draft.render_id)?.manifest : latestManifest(review);
  if (!manifest) return fail("RENDER_NOT_FOUND", draft.render_id ? `No retained render ${draft.render_id}. Retained: ${review.manifests.map((entry) => entry.manifest.render_id).join(", ") || "none"}.` : "This video has no retained render yet. Capture one with `vcr capture <scene> --video <id>` first.");
  const scene = sceneForFrame(manifest, draft.frame);
  if (!scene) return fail("INVALID_ARGUMENT", `Frame ${draft.frame} is outside render ${manifest.render_id} (0–${manifest.duration_frames - 1}).`);
  if (draft.frame_end !== undefined && draft.frame_end < draft.frame) return fail("INVALID_ARGUMENT", `--frame-end ${draft.frame_end} is before --frame ${draft.frame}; it is inclusive.`);

  const { render_id: _ignored, ...fields } = draft;
  const candidate = { ...fields, render_id: manifest.render_id, scene_id: scene.id, scene_frame: draft.frame - scene.start_frame };
  const duplicate = listFindings(review).find((existing) => contentKey(existing) === contentKey(candidate));
  if (duplicate) return ok({ finding: duplicate, isCreated: false });

  const findingsDirectory = join(videoDirectory, REVIEW_PATHS.findings);
  mkdirSync(findingsDirectory, { recursive: true });
  // Claim the next free id with an exclusive link, so concurrent writers never share or overwrite one.
  for (let number = nextFindingNumber(review); ; number += 1) {
    const finding: Finding = { schema_version: "1.0.0", id: formatFindingId(number), ...candidate, status: "open", created_at: now.toISOString() };
    if (claimFile(join(findingsDirectory, `${finding.id}.json`), `${JSON.stringify(finding, null, 2)}\n`)) return ok({ finding, isCreated: true });
  }
}

/** The agent claims a fix with evidence: open (or addressed) → addressed. Idempotent; never touches a closed finding. */
export function addressFinding(videoDirectory: string, workspaceRoot: string, id: string, resolution: { render_id: string; note: string; evidence: string[] }, now: Date): Result<FindingWrite> {
  const found = findFinding(videoDirectory, workspaceRoot, id);
  if (!found.ok) return found;
  const finding = found.value;
  if (finding.status === "resolved" || finding.status === "wontfix") return fail("FINDING_CLOSED", `${id} is ${finding.status}; only a human reopens a closed finding.`);
  const review = readVideoReview(videoDirectory, workspaceRoot);
  if (!review.manifests.some((entry) => entry.manifest.render_id === resolution.render_id)) return fail("RENDER_NOT_FOUND", `No retained render ${resolution.render_id}; address a finding with the render that fixes it.`);
  const previous = finding.resolution;
  if (finding.status === "addressed" && previous && previous.render_id === resolution.render_id && previous.note === resolution.note && previous.evidence.join("\n") === resolution.evidence.join("\n")) return ok({ finding, isCreated: false });
  const updated: Finding = { ...finding, status: "addressed", resolution: { ...resolution, at: now.toISOString() } };
  writeJsonAtomic(join(videoDirectory, REVIEW_PATHS.findings, `${id}.json`), updated);
  return ok({ finding: updated, isCreated: true });
}

/** Human only: resolved or wontfix, recording the channel. Call it only behind a human-channel check. */
export function closeFinding(videoDirectory: string, workspaceRoot: string, id: string, status: "resolved" | "wontfix", channel: HumanChannel, note: string | undefined, now: Date): Result<FindingWrite> {
  const found = findFinding(videoDirectory, workspaceRoot, id);
  if (!found.ok) return found;
  if (found.value.status === status) return ok({ finding: found.value, isCreated: false });
  const updated: Finding = { ...found.value, status, closure: { channel, at: now.toISOString(), ...(note ? { note } : {}) } };
  writeJsonAtomic(join(videoDirectory, REVIEW_PATHS.findings, `${id}.json`), updated);
  return ok({ finding: updated, isCreated: true });
}

export function findFinding(videoDirectory: string, workspaceRoot: string, id: string): Result<Finding> {
  const finding = listFindings(readVideoReview(videoDirectory, workspaceRoot)).find((candidate) => candidate.id === id);
  return finding ? ok(finding) : fail("FINDING_NOT_FOUND", `No finding ${id} in ${videoDirectory}. List them with \`vcr findings list <video>\`.`);
}

export function formatFindingLine(finding: Finding): string {
  const range = finding.frame_end !== undefined && finding.frame_end !== finding.frame ? `${finding.frame}–${finding.frame_end}` : `${finding.frame}`;
  const rule = finding.rule_id ? ` ${finding.rule_id}` : "";
  return `${finding.id}  ${finding.status.padEnd(9)}  ${finding.severity.padEnd(7)}  ${finding.scene_id}@${range}${rule}  ${finding.text}`;
}

// === PRIVATE HELPERS ===

function nextFindingNumber(review: VideoReview): number {
  return Math.max(0, ...review.findings.map((entry) => Number(entry.finding.id.slice(2))).filter(Number.isFinite)) + 1;
}

function formatFindingId(number: number): string {
  return `F-${String(number).padStart(4, "0")}`;
}

/** The fields that make two notes the same note; ids, times and status do not. */
function contentKey(finding: Pick<Finding, "render_id" | "frame" | "severity" | "text" | "author"> & Partial<Finding>): string {
  return JSON.stringify([finding.render_id, finding.frame, finding.frame_end ?? null, finding.severity, finding.text, finding.author.kind, finding.rule_id ?? null, finding.selector ?? null, finding.region ?? null]);
}

/** Writes a temp file then hard-links it into place: atomic, and false instead of overwriting when the name is taken. */
function claimFile(path: string, content: string): boolean {
  const temporaryPath = `${path}.${process.pid}.${Date.now()}.tmp`;
  writeFileSync(temporaryPath, content);
  try {
    linkSync(temporaryPath, path);
    return true;
  } catch (cause) {
    if ((cause as NodeJS.ErrnoException).code === "EEXIST" || existsSync(path)) return false;
    throw cause;
  } finally {
    unlinkSync(temporaryPath);
  }
}
