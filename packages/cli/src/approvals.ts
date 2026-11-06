import { join } from "node:path";
import { writeJsonAtomic } from "./repository.js";
import { fail, ok, type Result } from "./result.types.js";
import { latestManifest, readVideoReview, REVIEW_PATHS, type Approval } from "./review.js";

// Human-only channels (PRD §6.4, RV-03): an interactive terminal where the person types the video
// id, or the token-gated review page (P3). Agent hosts run commands without a TTY, so they are refused.
// A guardrail against accidental self-approval, not a security boundary.

// === TYPES ===

export interface TerminalIo {
  isInteractive: boolean;
  /** Prints the prompt and resolves with the line typed. */
  ask(prompt: string): Promise<string>;
}

export interface ApprovalWrite {
  approval: Approval;
  isCreated: boolean;
}

// === PUBLIC API ===

/** Ok only when a person at an interactive terminal types the video id back. */
export async function confirmHumanAtTerminal(io: TerminalIo, videoId: string, action: string): Promise<Result<"tty">> {
  if (!io.isInteractive) {
    return fail("HUMAN_CHANNEL_REQUIRED", `"${action}" is a human decision and needs an interactive terminal; this one has none, and agent hosts never do. Ask the person to run the same command in their own terminal.`);
  }
  const typed = (await io.ask(`${action} for ${videoId}. Type the video id to confirm: `)).trim();
  if (typed !== videoId) return fail("CONFIRMATION_MISMATCH", `Typed "${typed}", expected "${videoId}". Nothing was written.`);
  return ok("tty");
}

/** Writes review/approvals/<render_id>.json naming the retained manifest's hash. Idempotent on decision and hash. */
export function writeApprovalDecision(videoDirectory: string, workspaceRoot: string, decision: Approval["decision"], renderId: string | undefined, note: string | undefined, now: Date): Result<ApprovalWrite> {
  const review = readVideoReview(videoDirectory, workspaceRoot);
  const latest = latestManifest(review);
  const target = renderId ? review.manifests.find((entry) => entry.manifest.render_id === renderId) : review.manifests.find((entry) => entry.manifest.render_id === latest?.render_id);
  if (!target) return fail("RENDER_NOT_FOUND", renderId ? `No retained render ${renderId}.` : "This video has no retained render to decide on.");
  const existing = review.approvals.find((entry) => entry.approval.render_id === target.manifest.render_id)?.approval;
  if (existing && existing.decision === decision && existing.manifest_sha256 === target.sha256 && (note === undefined || existing.note === note)) return ok({ approval: existing, isCreated: false });
  const approval: Approval = { schema_version: "1.0.0", render_id: target.manifest.render_id, decision, manifest_sha256: target.sha256, channel: "tty", at: now.toISOString(), ...(note ? { note } : {}) };
  writeJsonAtomic(join(videoDirectory, REVIEW_PATHS.approvals, `${approval.render_id}.json`), approval);
  return ok({ approval, isCreated: true });
}
