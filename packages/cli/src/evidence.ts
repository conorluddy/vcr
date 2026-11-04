import { existsSync } from "node:fs";
import { hostname as osHostname } from "node:os";
import { join } from "node:path";
import type { EnvironmentRecord, ProbeResult } from "./doctor.js";
import { readJsonFile } from "./repository.js";

// Evidence and readiness are separate questions an agent asks of a tool:
//   evidence:  what did a recorded run prove, and how exactly is its version known?
//   readiness: is the tool on this machine, per the last `vcr doctor` record?
// Neither changes validation.status or adapter_maturity, and neither infers the other:
// an installed tool at a different version is "untested", never verified.

// === TYPES ===

/** How precisely a recorded version identifies what ran. Legacy strings are classified, never rewritten. */
export type VersionScope = "exact" | "inexact" | "not-applicable" | "unknown";

export type Readiness =
  | { state: "installed"; version: string | null; checkedAt: string; hostname: string }
  | { state: "missing" | "probe-error" | "not-probed"; checkedAt: string }
  | { state: "no-machine-record" };

export type EvidenceMatch = "same-version" | "different-version" | "unknown";

export interface EvidenceRef {
  version?: string | undefined;
  hostname?: string | undefined;
}

// === PUBLIC API ===

export function versionScope(version: string | undefined | null): VersionScope {
  const text = (version ?? "").trim();
  if (!text) return "unknown";
  if (/^n\/a\b/i.test(text)) return "not-applicable";
  if (/\blatest\b|[\^~*<>≥≤]|\bx\b|\.x\b|\d\+(?:\s|$|,)|\brange\b|\bor (?:later|newer|above)\b/i.test(text)) return "inexact";
  if (/^N-\d+-g[0-9a-f]+/.test(text)) return "exact";
  // A commit pin (git 3f2a1b9, or a bare 7–40 character hex SHA) identifies what ran exactly.
  if (/(?:^|\s)[0-9a-f]{7,40}$/i.test(text) && /\d/.test(text)) return "exact";
  return versionTokens(text).length > 0 ? "exact" : "unknown";
}

/** Reads `<machine>/environment/<hostname>.json`, read-only. Undefined when absent, unreadable or the wrong shape. */
export function loadMachineRecord(machineRoot: string, hostname: string = osHostname()): EnvironmentRecord | undefined {
  const path = join(machineRoot, "environment", `${hostname}.json`);
  if (!existsSync(path)) return undefined;
  const parsed = readJsonFile<Partial<EnvironmentRecord>>(path);
  if (!parsed.ok) return undefined;
  const record = parsed.value;
  if (typeof record !== "object" || record === null || typeof record.checked_at !== "string" || !Array.isArray(record.tools)) return undefined;
  const tools = record.tools.filter(isProbeResult);
  return { ...(record as EnvironmentRecord), hostname: typeof record.hostname === "string" ? record.hostname : hostname, tools };
}

export function assessReadiness(toolId: string, record: EnvironmentRecord | undefined): Readiness {
  if (!record) return { state: "no-machine-record" };
  const probe = record.tools.find((entry) => entry.tool_id === toolId);
  if (!probe) return { state: "not-probed", checkedAt: record.checked_at };
  if (probe.status === "installed") return { state: "installed", version: probe.version, checkedAt: record.checked_at, hostname: record.hostname };
  return { state: probe.status === "missing" ? "missing" : "probe-error", checkedAt: record.checked_at };
}

/** Compares the local probe with an evidence version. Only an exact, equal version counts as the same. */
export function compareToEvidence(evidenceVersion: string | undefined, probe: Pick<ProbeResult, "version"> | undefined): EvidenceMatch {
  if (!probe?.version || versionScope(evidenceVersion) !== "exact") return "unknown";
  const evidence = evidenceVersion!.trim();
  if (evidence === probe.version.trim()) return "same-version";
  const evidenceTokens = new Set(versionTokens(evidence));
  const probeTokens = versionTokens(probe.version);
  if (probeTokens.length === 0) return "unknown";
  return probeTokens.some((token) => evidenceTokens.has(token)) ? "same-version" : "different-version";
}

export function formatReadiness(readiness: Readiness, evidence: EvidenceRef | undefined): string {
  const day = (iso: string) => iso.slice(0, 10);
  switch (readiness.state) {
    case "no-machine-record":
      return "this machine: no vcr doctor record (run vcr doctor)";
    case "not-probed":
      return "this machine: vcr doctor does not check this tool (check the project's dependencies)";
    case "missing":
      return `this machine: missing (doctor ${day(readiness.checkedAt)})`;
    case "probe-error":
      return `this machine: probe failed (doctor ${day(readiness.checkedAt)})`;
    case "installed":
      return `this machine: has ${readiness.version ?? "an unparsed version"}${evidenceNote(readiness, evidence)} (doctor ${day(readiness.checkedAt)})`;
  }
}

// === PRIVATE HELPERS ===

function evidenceNote(readiness: Extract<Readiness, { state: "installed" }>, evidence: EvidenceRef | undefined): string {
  if (!evidence) return "";
  const match = compareToEvidence(evidence.version, { version: readiness.version });
  if (match === "unknown") return versionScope(evidence.version) === "exact" ? "; local version could not be compared with the evidence" : "; evidence version not exact, cannot compare";
  const where = evidence.hostname && evidence.hostname === readiness.hostname ? "here" : "on another host";
  if (match === "same-version") return `; evidence ran this version ${where}`;
  return `; evidence ran ${evidence.version} ${where}, so this version is untested`;
}

/** Version-like tokens with any leading "n"/"v" dropped, e.g. "Chromium 156.0.8078.4" → ["156.0.8078.4"], "n7.1" → ["7.1"]. */
function versionTokens(version: string): string[] {
  return version.match(/\d+(?:\.\d+)+(?:[-+][0-9A-Za-z.]+)?/g) ?? [];
}

function isProbeResult(entry: unknown): entry is ProbeResult {
  if (typeof entry !== "object" || entry === null) return false;
  const probe = entry as Record<string, unknown>;
  return typeof probe["tool_id"] === "string" && typeof probe["status"] === "string" && (typeof probe["version"] === "string" || probe["version"] === null);
}
