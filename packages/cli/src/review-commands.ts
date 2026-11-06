import { addFinding, addressFinding, closeFinding, findFinding, formatFindingLine, listFindings } from "./findings.js";
import { confirmHumanAtTerminal, writeApprovalDecision, type TerminalIo } from "./approvals.js";
import { fail, ok, type Result } from "./result.types.js";
import { readVideoReview, type Finding, type Severity } from "./review.js";
import { writeReviewSummary } from "./review-summary.js";
import { resolveVideo } from "./video.js";

// `vcr findings …` (agent-safe) and `vcr review approve|request-changes|resolve` (human only).
// Each returns what to print; index.ts owns printing and exit codes.

// === TYPES ===

export interface CommandOutput {
  json: unknown;
  text: string;
}

type Flags = Record<string, string | true>;

const SEVERITIES: Severity[] = ["blocker", "major", "minor", "note"];

// === PUBLIC API ===

export function runFindingsCommand(workspaceRoot: string, subcommand: string, videoId: string, findingId: string | undefined, flags: Flags, now: Date): Result<CommandOutput> {
  const video = resolveVideo(workspaceRoot, videoId);
  if (!video.ok) return video;
  const { directory } = video.value;

  if (subcommand === "list") {
    const limit = flags["limit"] === undefined ? 50 : Number(flags["limit"]);
    const offset = flags["offset"] === undefined ? 0 : Number(flags["offset"]);
    if (!Number.isInteger(limit) || limit < 1 || !Number.isInteger(offset) || offset < 0) return fail("INVALID_ARGUMENT", "--limit must be a whole number of 1 or more and --offset of 0 or more.");
    const matching = listFindings(readVideoReview(directory, workspaceRoot), { status: text(flags["status"]), renderId: text(flags["render"]) });
    const page = matching.slice(offset, offset + limit);
    const footer = matching.length > offset + page.length ? `\n${offset + 1}–${offset + page.length} of ${matching.length}; next page: --offset ${offset + page.length}` : "";
    return ok({ json: { total: matching.length, offset, limit, findings: page }, text: page.length === 0 ? "no matching findings" : `${page.map(formatFindingLine).join("\n")}${footer}` });
  }

  if (subcommand === "show") {
    if (!findingId) return fail("INVALID_ARGUMENT", "findings show needs a finding id, e.g. F-0001.");
    const finding = findFinding(directory, workspaceRoot, findingId);
    if (!finding.ok) return finding;
    return ok({ json: finding.value, text: JSON.stringify(finding.value, null, 2) });
  }

  if (subcommand === "add") {
    const draft = findingDraftFromFlags(flags);
    if (!draft.ok) return draft;
    const outcome = addFinding(directory, workspaceRoot, draft.value, now);
    if (!outcome.ok) return outcome;
    return ok(afterWrite(directory, workspaceRoot, videoId, outcome.value, outcome.value.isCreated ? `added ${formatFindingLine(outcome.value.finding)}` : `${outcome.value.finding.id} already records this note; nothing written`));
  }

  if (subcommand === "address") {
    if (!findingId) return fail("INVALID_ARGUMENT", "findings address needs a finding id, e.g. F-0001.");
    const renderId = text(flags["render"]);
    const note = text(flags["note"]);
    if (!renderId || !note) return fail("INVALID_ARGUMENT", "findings address needs --render <id> (the render with the fix) and --note <text>.");
    const evidence = (text(flags["evidence"]) ?? "").split(",").map((path) => path.trim()).filter(Boolean);
    const outcome = addressFinding(directory, workspaceRoot, findingId, { render_id: renderId, note, evidence }, now);
    if (!outcome.ok) return outcome;
    return ok(afterWrite(directory, workspaceRoot, videoId, outcome.value, outcome.value.isCreated ? `${findingId} addressed in ${renderId}; a human resolves it` : `${findingId} is already addressed this way; nothing written`));
  }

  return fail("INVALID_ARGUMENT", `Unknown findings command "${subcommand}". Use list, show, add or address.`);
}

/** Human-only decisions; refused unless a person at an interactive terminal types the video id. */
export async function runReviewDecision(workspaceRoot: string, subcommand: string, videoId: string, findingId: string | undefined, flags: Flags, io: TerminalIo, now: Date): Promise<Result<CommandOutput>> {
  const video = resolveVideo(workspaceRoot, videoId);
  if (!video.ok) return video;
  const { directory } = video.value;
  const note = text(flags["note"]);

  if (subcommand === "resolve") {
    if (!findingId) return fail("INVALID_ARGUMENT", "review resolve needs a finding id, e.g. F-0001.");
    const status = flags["wontfix"] === true ? "wontfix" : "resolved";
    const found = findFinding(directory, workspaceRoot, findingId);
    if (!found.ok) return found;
    const human = await confirmHumanAtTerminal(io, videoId, `Mark ${findingId} ${status}`);
    if (!human.ok) return human;
    const outcome = closeFinding(directory, workspaceRoot, findingId, status, human.value, note, now);
    if (!outcome.ok) return outcome;
    return ok(afterWrite(directory, workspaceRoot, videoId, outcome.value, `${findingId} ${status}`));
  }

  const decision = subcommand === "approve" ? "approved" : subcommand === "request-changes" ? "changes_requested" : undefined;
  if (!decision) return fail("INVALID_ARGUMENT", `Unknown review command "${subcommand}". Use approve, request-changes or resolve.`);
  const human = await confirmHumanAtTerminal(io, videoId, decision === "approved" ? "Approve the render" : "Request changes on the render");
  if (!human.ok) return human;
  const outcome = writeApprovalDecision(directory, workspaceRoot, decision, text(flags["render"]), note, now);
  if (!outcome.ok) return outcome;
  return ok(afterWrite(directory, workspaceRoot, videoId, outcome.value, `${outcome.value.approval.render_id} ${decision.replace("_", " ")}`));
}

// === PRIVATE HELPERS ===

function afterWrite(directory: string, workspaceRoot: string, videoId: string, outcome: { isCreated: boolean }, line: string): CommandOutput {
  const isSummaryUpdated = writeReviewSummary(directory, videoId, readVideoReview(directory, workspaceRoot));
  return { json: { ...outcome, summaryUpdated: isSummaryUpdated }, text: line };
}

function findingDraftFromFlags(flags: Flags): Result<Omit<Finding, "schema_version" | "id" | "render_id" | "scene_id" | "scene_frame" | "status" | "created_at"> & { render_id?: string }> {
  const frame = Number(flags["frame"]);
  const severity = text(flags["severity"]) as Severity | undefined;
  const noteText = text(flags["text"]);
  if (!Number.isInteger(frame) || frame < 0) return fail("INVALID_ARGUMENT", "--frame must be a composition frame number of 0 or more.");
  if (!severity || !SEVERITIES.includes(severity)) return fail("INVALID_ARGUMENT", `--severity must be one of ${SEVERITIES.join(", ")}.`);
  if (!noteText) return fail("INVALID_ARGUMENT", "--text is required: one issue, in a sentence.");
  const frameEnd = flags["frame-end"] === undefined ? undefined : Number(flags["frame-end"]);
  if (frameEnd !== undefined && !Number.isInteger(frameEnd)) return fail("INVALID_ARGUMENT", "--frame-end must be a whole frame number.");
  const authorKind = text(flags["author"]) ?? "agent";
  if (authorKind !== "agent" && authorKind !== "human") return fail("INVALID_ARGUMENT", "--author must be agent or human.");
  const optional = { render_id: text(flags["render"]), frame_end: frameEnd, rule_id: text(flags["rule"]), selector: text(flags["selector"]) };
  return ok({
    frame,
    severity,
    text: noteText,
    author: { kind: authorKind },
    source: "cli",
    ...Object.fromEntries(Object.entries(optional).filter(([, value]) => value !== undefined)),
  });
}

function text(value: string | true | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}
