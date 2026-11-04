import { existsSync } from "node:fs";
import { join } from "node:path";
import { compareToEvidence, versionScope, type EvidenceRef } from "./evidence.js";
import { readJsonFile } from "./repository.js";

// Libraries installed per project (pnpm add gsap) are not machine tools, so `vcr doctor` never
// probes them. Their readiness is a property of the current project: is the package in its
// node_modules, and at which version? Read-only; never walks up to a parent project.

// === TYPES ===

export interface ProjectPackage {
  name: string;
  /** Installed version, or null when the project has no such package. */
  version: string | null;
}

// === PUBLIC API ===

/** Package names a record installs per project, from its install command. Global installs, dlx and npx are not per-project. */
export function npmPackagesFor(installCommand: string | undefined): string[] {
  const first = (installCommand ?? "").split("&&")[0]!.trim();
  const match = /^(?:pnpm\s+add|npm\s+(?:i|install)|yarn\s+add)\s+(.+)$/.exec(first);
  if (!match) return [];
  const words = match[1]!.split(/\s+/);
  if (words.some((word) => word === "-g" || word === "--global")) return [];
  return words.filter((word) => !word.startsWith("-")).map(stripVersionSpec).filter((name) => /^(?:@[\w.-]+\/)?[\w.-]+$/.test(name));
}

/** Reads `<projectRoot>/node_modules/<name>/package.json` for each package. */
export function projectPackageVersions(projectRoot: string, names: string[]): ProjectPackage[] {
  return names.map((name) => {
    const path = join(projectRoot, "node_modules", name, "package.json");
    if (!existsSync(path)) return { name, version: null };
    const parsed = readJsonFile<{ version?: unknown }>(path);
    return { name, version: parsed.ok && typeof parsed.value.version === "string" ? parsed.value.version : null };
  });
}

export function formatProjectReadiness(packages: ProjectPackage[], installCommand: string, evidence: EvidenceRef | undefined): string {
  const missing = packages.filter((entry) => entry.version === null);
  if (missing.length === packages.length) return `this project: not installed (${installCommand.split("&&")[0]!.trim()})`;
  const installed = packages.filter((entry) => entry.version !== null).map((entry) => `${entry.name} ${entry.version}`).join(", ");
  const partial = missing.length ? `; missing ${missing.map((entry) => entry.name).join(", ")}` : "";
  return `this project: has ${installed}${partial}${evidenceNote(packages[0]!, evidence)}`;
}

// === PRIVATE HELPERS ===

function evidenceNote(primary: ProjectPackage, evidence: EvidenceRef | undefined): string {
  if (!evidence || primary.version === null) return "";
  const match = compareToEvidence(evidence.version, { version: primary.version });
  if (match === "same-version") return "; same version as evidence";
  if (match === "different-version") return `; evidence ran ${evidence.version}, so this version is untested`;
  return versionScope(evidence.version) === "exact" ? "; version could not be compared with the evidence" : "; evidence version not exact, cannot compare";
}

/** "gsap@3.15.0" → "gsap", "@scope/pkg@^1" → "@scope/pkg". */
function stripVersionSpec(word: string): string {
  const at = word.lastIndexOf("@");
  return at > 0 ? word.slice(0, at) : word;
}
