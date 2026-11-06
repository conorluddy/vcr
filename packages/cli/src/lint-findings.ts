import type { LintFinding, LintReport, SafeZone } from "@vcr/lint";
import { addFinding, type FindingDraft } from "./findings.js";
import type { RenderManifest, Severity } from "./review.js";

// `vcr lint --video`: the first automatic producer of findings (plugin PRD §6.4). Each lint finding
// becomes a measured, deterministic finding on a retained render; re-running lint writes nothing new.

// === TYPES ===

export interface LintFindingsOutcome {
  created: string[];
  unchanged: string[];
  /** Lint findings that could not be filed, with why. */
  skipped: Array<{ finding: LintFinding; reason: string }>;
}

const SEVERITY_ORDER: Severity[] = ["note", "minor", "major", "blocker"];

// === PUBLIC API ===

/** Maps one lint finding onto the finding contract; the scene comes from the manifest via the frame. */
export function findingDraftFromLint(finding: LintFinding, manifest: RenderManifest, safeZone: SafeZone | null, rulesVersion: string): FindingDraft {
  const frame = Math.min(manifest.duration_frames - 1, Math.max(0, Math.round(finding.t * manifest.fps)));
  const isSafeZone = finding.rule === "TYPO-SAFE";
  const tier = isSafeZone ? safeZone?.tier : undefined;
  return {
    render_id: manifest.render_id,
    frame,
    severity: severityFor(finding, tier),
    text: `${finding.text ? `"${finding.text}": ` : ""}${finding.problem}${finding.verified ? "" : " (preset figures unverified)"}`,
    author: { kind: "agent", name: "vcr-lint" },
    source: "cli",
    selector: finding.selector,
    ...(isSafeZone ? { rule_id: "TYPO-SAFE" } : {}),
    kind: "measured",
    severity_basis: tier === "standard" ? "standard_rule" : tier === "platform" ? "platform_rule" : tier === "heuristic" ? "heuristic_rule" : "measured_rule",
    confidence: { value: 1, basis: "deterministic" },
    evidence: { metric: `lint:${finding.rule} px`, value: finding.measured, threshold: finding.limit },
    reviewer: { agent: "vcr-lint", rules_version: rulesVersion },
  };
}

export function writeLintFindings(videoDirectory: string, workspaceRoot: string, report: LintReport, manifest: RenderManifest, safeZone: SafeZone | null, rulesVersion: string, now: Date): LintFindingsOutcome {
  const outcome: LintFindingsOutcome = { created: [], unchanged: [], skipped: [] };
  for (const finding of report.findings) {
    const written = addFinding(videoDirectory, workspaceRoot, findingDraftFromLint(finding, manifest, safeZone, rulesVersion), now);
    if (!written.ok) outcome.skipped.push({ finding, reason: written.error.message });
    else (written.value.isCreated ? outcome.created : outcome.unchanged).push(written.value.finding.id);
  }
  return outcome;
}

// === PRIVATE HELPERS ===

/**
 * Text leaving the frame or a collapsed root is a blocker; overflow is major. A safe-zone crossing
 * takes its preset's tier: a heuristic preset alone is at most minor until evidence frames exist
 * (#63), since a heuristic major needs an artifact; an unverified preset caps at major.
 */
function severityFor(finding: LintFinding, tier: SafeZone["tier"] | undefined): Severity {
  let severity: Severity = finding.rule === "overflow" ? "major" : "blocker";
  if (finding.rule === "TYPO-SAFE" && tier === "heuristic") severity = "minor";
  if (!finding.verified) severity = lower(severity, "major");
  return severity;
}

function lower(severity: Severity, cap: Severity): Severity {
  return SEVERITY_ORDER.indexOf(severity) > SEVERITY_ORDER.indexOf(cap) ? cap : severity;
}
