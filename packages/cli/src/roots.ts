import { existsSync, mkdirSync, unlinkSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { fail, ok, type Result } from "./result.types.js";

// === TYPES ===

/** The three places VCR reads and writes. See `specifications/vcr-plugin-prd.md` §6.1. */
export interface Roots {
  /** Catalogue, skills, examples and schemas. Read-only at runtime. */
  harness: string;
  /** The selected workspace, or null when none is selected and no ancestor of cwd holds `vcr.json`. */
  workspace: string | null;
  /** Machine state shared by every host: environment record, capture runtime. */
  machine: string;
  /** Why `machine` is where it is. The Codex fallback applies when its sandbox cannot write `~/.vcr` (spike S1). */
  machineSource: "VCR_HOME" | "default" | "workspace-codex-fallback";
  /** Running inside the Codex seatbelt sandbox: capture needs `--single-process` and temp files inside `machine`. */
  isCodexSandbox: boolean;
  /** Harness and workspace are the same directory, so maintainer commands may write into the harness. */
  isDevMode: boolean;
}

export interface RootInputs {
  cwd: string;
  env: Record<string, string | undefined>;
  workspaceFlag?: string | undefined;
  /** Where the CLI itself lives; the harness is found by walking up from here. */
  cliDirectory?: string | undefined;
  /** Injectable for tests; the default creates the directory and writes and removes a probe file. */
  canWrite?: ((directory: string) => boolean) | undefined;
}

export const WORKSPACE_MARKER = "vcr.json";

// === PUBLIC API ===

/** Resolves harness, workspace and machine roots in the documented order. Only a missing harness is an error. */
export function resolveRoots({ cwd, env, workspaceFlag, cliDirectory = dirname(fileURLToPath(import.meta.url)), canWrite = isWritableDirectory }: RootInputs): Result<Roots> {
  const harness = resolveHarness(env["VCR_HARNESS"], cliDirectory);
  if (!harness.ok) return harness;
  const explicitWorkspace = workspaceFlag ?? env["VCR_WORKSPACE"];
  const workspace = explicitWorkspace ? resolve(cwd, explicitWorkspace) : findAncestorWithMarker(cwd);
  const isCodexSandbox = Boolean(env["CODEX_SANDBOX"]);
  const machine = resolveMachine(env["VCR_HOME"], workspace, isCodexSandbox, canWrite);
  return ok({ harness: harness.value, workspace, ...machine, isCodexSandbox, isDevMode: workspace === harness.value });
}

/** Narrows to a workspace that exists, or explains how to create one. */
export function requireWorkspace(roots: Roots): Result<string> {
  if (roots.workspace && existsSync(join(roots.workspace, WORKSPACE_MARKER))) return ok(roots.workspace);
  const where = roots.workspace ?? "this directory or any ancestor";
  return fail("WORKSPACE_NOT_FOUND", `No ${WORKSPACE_MARKER} in ${where}. Run \`vcr workspace init\` in the directory that should hold your projects, or pass --workspace <dir>.`);
}

/** Refuses commands that write into the harness unless running inside the harness repository. */
export function requireDevMode(roots: Roots, command: string): Result<string> {
  if (roots.isDevMode) return ok(roots.harness);
  return fail("MAINTAINER_ONLY", `\`vcr ${command}\` writes into the harness and only runs inside the harness repository (${roots.harness}).`);
}

// === PRIVATE HELPERS ===

function resolveHarness(explicitHarness: string | undefined, cliDirectory: string): Result<string> {
  if (explicitHarness) {
    const harness = resolve(explicitHarness);
    if (existsSync(join(harness, "catalog"))) return ok(harness);
    return fail("HARNESS_NOT_FOUND", `VCR_HARNESS=${explicitHarness} has no catalog/ directory. Point it at a VCR checkout or plugin directory, or unset it.`);
  }
  let current = resolve(cliDirectory);
  while (!existsSync(join(current, "catalog"))) {
    const parent = dirname(current);
    if (parent === current) return fail("HARNESS_NOT_FOUND", `No ancestor of ${cliDirectory} contains catalog/. Set VCR_HARNESS to a VCR checkout or plugin directory.`);
    current = parent;
  }
  return ok(current);
}

function resolveMachine(explicitHome: string | undefined, workspace: string | null, isCodexSandbox: boolean, canWrite: (directory: string) => boolean): Pick<Roots, "machine" | "machineSource"> {
  if (explicitHome) return { machine: resolve(explicitHome), machineSource: "VCR_HOME" };
  const defaultHome = join(homedir(), ".vcr");
  if (isCodexSandbox && workspace && !canWrite(defaultHome)) return { machine: join(workspace, ".vcr"), machineSource: "workspace-codex-fallback" };
  return { machine: defaultHome, machineSource: "default" };
}

function isWritableDirectory(directory: string): boolean {
  try {
    mkdirSync(directory, { recursive: true });
    const probe = join(directory, `.write-probe-${process.pid}`);
    writeFileSync(probe, "");
    unlinkSync(probe);
    return true;
  } catch {
    return false;
  }
}

function findAncestorWithMarker(startDirectory: string): string | null {
  let current = resolve(startDirectory);
  while (!existsSync(join(current, WORKSPACE_MARKER))) {
    const parent = dirname(current);
    if (parent === current) return null;
    current = parent;
  }
  return current;
}
