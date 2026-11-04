import { existsSync } from "node:fs";
import { hostname as osHostname } from "node:os";
import { join } from "node:path";
import type { EnvironmentRecord, ProbeResult } from "./doctor.js";
import { readJsonFile } from "./repository.js";

// Evidence and readiness are separate questions an agent asks of a tool:
//   evidence:  what did a recorded run prove, and how exactly is its version known?
//   readiness: is the tool on this machine, per the last `vcr doctor` record?
// Neither changes validation.status or adapter_maturity, and neither infers the other:
// an installed tool at a different version is "untested here", never verified.

// === TYPES ===

/** How precisely a recorded version identifies what ran. Legacy strings are classified, never rewritten. */
export type VersionScope = "exact" | "inexact" | "not-applicable" | "unknown";

export type Readiness =
  | { state: "installed"; version: string | null; checkedAt: string }
  | { state: "missing" | "probe-error"; checkedAt: string }
  | { state: "not-probed"; checkedAt: string }
  | { state: "no-machine-record" };

export type EvidenceMatch = "same-version" | "different-version" | "unknown";

// === PUBLIC API ===

export function versionScope(version: string | undefined | null): VersionScope {
  const text = (version ?? "").trim();
  if (!text) return "unknown";
  if (/^n\/a\b/i.test(text)) return "not-applicable";
  if (/\blatest\b|[\^~*]|>=|<=|\bx\b|\.x\b|\brange\b/i.test(text)) return "inexact";
  return /\d+\.\d+/.test(text) ? "exact" : "unknown";
}

/** Reads `<machine>/environment/<hostname>.json`, read-only. Undefined when absent or unreadable. */
export function loadMachineRecord(machineRoot: string, hostname: string = osHostname()): EnvironmentRecord | undefined {
  const path = join(machineRoot, "environment", `${hostname}.json`);
  if (!existsSync(path)) return undefined;
  const parsed = readJsonFile<EnvironmentRecord>(path);
  return parsed.ok && Array.isArray(parsed.value.tools) ? parsed.value : undefined;
}

export function assessReadiness(toolId: string, record: EnvironmentRecord | undefined): Readiness {
  if (!record) return { state: "no-machine-record" };
  const probe = record.tools.find((entry) => entry.tool_id === toolId);
  if (!probe) return { state: "not-probed", checkedAt: record.checked_at };
  if (probe.status === "installed") return { state: "installed", version: probe.version, checkedAt: record.checked_at };
  return { state: probe.status === "missing" ? "missing" : "probe-error", checkedAt: record.checked_at };
}

/** Compares the local probe with the latest evidence version. Only an exact, equal version counts as the same. */
export function compareToEvidence(evidenceVersion: string | undefined, probe: Pick<ProbeResult, "version"> | undefined): EvidenceMatch {
  if (!probe?.version || versionScope(evidenceVersion) !== "exact") return "unknown";
  return versionTokens(evidenceVersion!).includes(probe.version) ? "same-version" : "different-version";
}

export function formatReadiness(readiness: Readiness, evidenceVersion: string | undefined): string {
  const day = (iso: string) => iso.slice(0, 10);
  switch (readiness.state) {
    case "no-machine-record":
      return "this machine unknown (run vcr doctor)";
    case "not-probed":
      return "this machine not probed by vcr doctor";
    case "missing":
      return `this machine missing (doctor ${day(readiness.checkedAt)})`;
    case "probe-error":
      return `this machine probe failed (doctor ${day(readiness.checkedAt)})`;
    case "installed": {
      const match = compareToEvidence(evidenceVersion, { version: readiness.version });
      const note = match === "same-version" ? ", same version as evidence" : match === "different-version" ? ", differs from evidence: untested here" : "";
      return `this machine installed ${readiness.version ?? "(version unparsed)"}${note} (doctor ${day(readiness.checkedAt)})`;
    }
  }
}

// === PRIVATE HELPERS ===

/** Version-like tokens in a free-text version field, e.g. "Chromium 156.0.8078.4" → ["156.0.8078.4"]. */
function versionTokens(version: string): string[] {
  return version.match(/\d+(?:\.\d+)+(?:[-+][0-9A-Za-z.]+)?/g) ?? [];
}
