import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { compareToEvidence, versionScope, type EvidenceRef } from "./evidence.js";
import { readJsonFile } from "./repository.js";

// Libraries installed per project (pnpm add gsap) are not machine tools, so `vcr doctor` never
// probes them. Their readiness is a property of the current project: can it resolve the package,
// and at which version? Lookup follows Node: from the current directory up through parents, but
// never above the VCR workspace root (or, with no workspace, above the nearest package.json). Read-only.

// === TYPES ===

export interface ProjectPackage {
  name: string;
  /** Installed version, or null when the project cannot resolve the package. */
  version: string | null;
  /** True when node_modules/<name>/package.json exists but could not be read. */
  unreadable?: boolean;
}

// === PUBLIC API ===

/** Package names a record installs per project, from its install command. Global installs, dlx and npx are not per-project. */
export function npmPackagesFor(installCommand: string | undefined): string[] {
  const first = (installCommand ?? "").split("&&")[0]!.trim();
  const match = /^(?:pnpm\s+add|npm\s+(?:i|install)|yarn\s+add)\s+(.+)$/.exec(first);
  if (!match) return [];
  const words = match[1]!.split(/\s+/);
  if (words.some((word) => word === "-g" || word === "--global")) return [];
  return words.filter((word) => !word.startsWith("-")).map(stripVersionSpec).filter((name) => /^(?:@[\w-][\w.-]*\/)?[\w-][\w.-]*$/.test(name));
}

/** Resolves each package from `startDir` upwards, stopping at `stopDir` when given, else at the nearest directory with a package.json. */
export function projectPackageVersions(startDir: string, names: string[], stopDir?: string): ProjectPackage[] {
  const directories = searchDirectories(resolve(startDir), stopDir ? resolve(stopDir) : undefined);
  return names.map((name) => {
    for (const directory of directories) {
      const path = join(directory, "node_modules", name, "package.json");
      if (!existsSync(path)) continue;
      const parsed = readJsonFile<{ version?: unknown }>(path);
      if (parsed.ok && typeof parsed.value.version === "string") return { name, version: parsed.value.version };
      return { name, version: null, unreadable: true };
    }
    return { name, version: null };
  });
}

export function formatProjectReadiness(packages: ProjectPackage[], installCommand: string, evidence: EvidenceRef | undefined): string {
  const unreadable = packages.filter((entry) => entry.unreadable);
  if (unreadable.length) return `this project: ${unreadable.map((entry) => entry.name).join(", ")} present but its package.json is unreadable`;
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

function searchDirectories(start: string, stop: string | undefined): string[] {
  const directories: string[] = [];
  const insideStop = stop !== undefined && (start === stop || start.startsWith(stop + "/") || start.startsWith(stop + "\\"));
  let directory = start;
  for (;;) {
    directories.push(directory);
    if (insideStop ? directory === stop : existsSync(join(directory, "package.json"))) break;
    const parent = dirname(directory);
    if (parent === directory) break;
    directory = parent;
  }
  return directories;
}

/** "gsap@3.15.0" → "gsap", "@scope/pkg@^1" → "@scope/pkg". */
function stripVersionSpec(word: string): string {
  const at = word.lastIndexOf("@");
  return at > 0 ? word.slice(0, at) : word;
}
