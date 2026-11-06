import { describe, expect, test } from "vitest";
import { confirmHumanAtTerminal, writeApprovalDecision, type TerminalIo } from "./approvals.js";
import { runReviewDecision } from "./review-commands.js";
import { addFinding } from "./findings.js";
import { readVideoReview } from "./review.js";
import { reviewSummaryDiagnostics } from "./review-summary.js";
import { validateWorkspace } from "./validate.js";
import { createFixtureWorkspace, FIXTURE_RENDER_ID, FIXTURE_VIDEO_ID, harnessRoot, writeRetainedManifest } from "./test-workspace.js";

const now = new Date("2026-11-06T13:00:00.000Z");
const agentHost: TerminalIo = { isInteractive: false, ask: async () => { throw new Error("an agent host is never asked"); } };
const person = (typed: string): TerminalIo => ({ isInteractive: true, ask: async () => typed });

function videoWithRender() {
  const fixture = createFixtureWorkspace();
  const manifestSha256 = writeRetainedManifest(fixture.videoDirectory);
  return { ...fixture, manifestSha256 };
}

describe("the human channel", () => {
  test("is refused without an interactive terminal", async () => {
    expect(await confirmHumanAtTerminal(agentHost, FIXTURE_VIDEO_ID, "Approve")).toMatchObject({ ok: false, error: { code: "HUMAN_CHANNEL_REQUIRED", retryable: false } });
  });

  test("is refused when the typed id does not match", async () => {
    expect(await confirmHumanAtTerminal(person("demo/other"), FIXTURE_VIDEO_ID, "Approve")).toMatchObject({ ok: false, error: { code: "CONFIRMATION_MISMATCH" } });
  });

  test("an agent cannot approve: nothing is written", async () => {
    const { root, videoDirectory } = videoWithRender();
    expect(await runReviewDecision(root, "approve", FIXTURE_VIDEO_ID, undefined, {}, agentHost, now)).toMatchObject({ ok: false, error: { code: "HUMAN_CHANNEL_REQUIRED" } });
    expect(readVideoReview(videoDirectory, root).approvals).toEqual([]);
  });

  test("a person approves the latest render; the approval names its manifest hash and validates", async () => {
    const { root, videoDirectory, manifestSha256 } = videoWithRender();
    expect(await runReviewDecision(root, "approve", FIXTURE_VIDEO_ID, undefined, {}, person(FIXTURE_VIDEO_ID), now)).toMatchObject({ ok: true });
    expect(readVideoReview(videoDirectory, root).approvals.map((entry) => entry.approval)).toEqual([expect.objectContaining({ render_id: FIXTURE_RENDER_ID, decision: "approved", manifest_sha256: manifestSha256, channel: "tty" })]);
    expect(validateWorkspace(harnessRoot(), root).diagnostics).toEqual([]);
  });

  test("a person resolves a finding and REVIEW.md follows", async () => {
    const { root, videoDirectory } = videoWithRender();
    addFinding(videoDirectory, root, { frame: 5, severity: "minor", text: "Tracking too tight.", author: { kind: "human" }, source: "cli" }, now);
    expect(await runReviewDecision(root, "resolve", FIXTURE_VIDEO_ID, "F-0001", {}, person(FIXTURE_VIDEO_ID), now)).toMatchObject({ ok: true });
    const review = readVideoReview(videoDirectory, root);
    expect(review.findings[0]!.finding).toMatchObject({ status: "resolved", closure: { channel: "tty" } });
    expect(reviewSummaryDiagnostics(videoDirectory, FIXTURE_VIDEO_ID, review, "REVIEW.md")).toEqual([]);
    expect(validateWorkspace(harnessRoot(), root).diagnostics).toEqual([]);
  });
});

describe("writeApprovalDecision", () => {
  test("is idempotent on decision and hash", () => {
    const { root, videoDirectory } = videoWithRender();
    expect(writeApprovalDecision(videoDirectory, root, "changes_requested", undefined, undefined, now)).toMatchObject({ ok: true, value: { isCreated: true } });
    expect(writeApprovalDecision(videoDirectory, root, "changes_requested", undefined, undefined, new Date())).toMatchObject({ ok: true, value: { isCreated: false } });
  });
});
