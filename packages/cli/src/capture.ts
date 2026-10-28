import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { captureFrames, type CaptureReport } from "@vcr/capture";
import { fail, ok, type Result } from "./result.types.js";
import type { Roots } from "./roots.js";

// === TYPES ===

/** Pinned to the version the capture fixtures were validated with; a test keeps it equal to packages/capture's. */
export const PLAYWRIGHT_VERSION = "1.64.1";

export type CaptureSetupStep =
  | { kind: "create-runtime"; directory: string }
  | { kind: "install-playwright"; directory: string; version: string }
  | { kind: "install-chromium"; directory: string; note: string };

export interface CaptureSetupPlan {
  runtimeDirectory: string;
  steps: CaptureSetupStep[];
}

export interface CaptureCommandOptions {
  sceneFile: string;
  width: number;
  height: number;
  fps: number;
  outputDirectory: string;
  verifyDeterminism: boolean;
}

// === PUBLIC API ===

export function runtimeDirectory(roots: Roots): string {
  return join(roots.machine, "runtime");
}

/** What `vcr setup capture` would change. Empty `steps` means the runtime is ready (L0-03: report before acting). */
export function planCaptureSetup(roots: Roots): CaptureSetupPlan {
  const directory = runtimeDirectory(roots);
  const steps: CaptureSetupStep[] = [];
  if (!existsSync(directory)) steps.push({ kind: "create-runtime", directory });
  if (installedPlaywrightVersion(directory) !== PLAYWRIGHT_VERSION) steps.push({ kind: "install-playwright", directory, version: PLAYWRIGHT_VERSION });
  if (!isChromiumInstalled(directory)) steps.push({ kind: "install-chromium", directory, note: "downloads Chromium (about 150 MB) into Playwright's browser cache, shared by every runtime on this machine" });
  return { runtimeDirectory: directory, steps };
}

/** Applies a plan with structured subprocess arguments. Idempotent: re-planning afterwards yields no steps. */
export function applyCaptureSetup(plan: CaptureSetupPlan, isCodexSandbox: boolean): Result<CaptureSetupPlan> {
  // The Codex seatbelt blocks ~/.npm, so npm caches inside the runtime instead.
  const npmEnvironment = isCodexSandbox ? { ...process.env, npm_config_cache: join(plan.runtimeDirectory, ".npm-cache") } : process.env;
  try {
    for (const step of plan.steps) {
      if (step.kind === "create-runtime") {
        mkdirSync(step.directory, { recursive: true });
        writeFileSync(join(step.directory, "package.json"), `${JSON.stringify({ name: "vcr-runtime", private: true }, null, 2)}\n`);
      }
      if (step.kind === "install-playwright") execFileSync("npm", ["install", "--no-audit", "--no-fund", `playwright@${step.version}`], { cwd: step.directory, stdio: "inherit", env: npmEnvironment });
      // Planned before Playwright existed; the shared browser cache may already hold this Chromium.
      if (step.kind === "install-chromium" && !isChromiumInstalled(step.directory)) {
        // The download writes to ~/Library/Caches/ms-playwright, which the seatbelt blocks; it hangs rather than failing (spike S1).
        if (isCodexSandbox) return fail("CHROMIUM_DOWNLOAD_BLOCKED", "Chromium is not cached on this machine and the Codex sandbox cannot download it. Run `vcr setup capture --yes` once from your own terminal; every workspace then shares the cached browser.");
        execFileSync(process.execPath, [join(step.directory, "node_modules/playwright/cli.js"), "install", "chromium"], { cwd: step.directory, stdio: "inherit" });
      }
    }
    return ok(plan);
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause);
    const hint = isCodexSandbox ? " Inside the Codex sandbox this needs network access: rerun Codex with a VCR-only profile (`codex -p vcr`) or `-c sandbox_workspace_write.network_access=true` for this run (not in the global config), or run `vcr setup capture --yes` from your own terminal." : "";
    return fail("CAPTURE_SETUP_FAILED", `${message}${hint}`, true);
  }
}

/** Captures a scene with the runtime from `vcr setup capture`, adapting Chromium to the Codex sandbox when needed. */
export async function runCapture(roots: Roots, options: CaptureCommandOptions): Promise<Result<CaptureReport>> {
  const runtime = runtimeDirectory(roots);
  const hasRuntime = installedPlaywrightVersion(runtime) !== null;
  if (!hasRuntime && !roots.isDevMode) return fail("CAPTURE_RUNTIME_MISSING", `No capture runtime in ${runtime}. Run \`vcr setup capture\` to see what it installs, then \`vcr setup capture --yes\`.`);
  if (!existsSync(options.sceneFile)) return fail("SCENE_NOT_FOUND", `${options.sceneFile} does not exist.`);
  if (roots.isCodexSandbox) {
    // Chromium writes temp profiles under TMPDIR; the seatbelt only allows the workspace and VCR_HOME (spike S1).
    process.env["TMPDIR"] = join(roots.machine, "tmp");
    mkdirSync(process.env["TMPDIR"], { recursive: true });
  }
  const report = await captureFrames({
    sceneFile: resolve(options.sceneFile),
    width: options.width,
    height: options.height,
    fps: options.fps,
    outputDirectory: join(options.outputDirectory, "frames"),
    verifyDeterminism: options.verifyDeterminism,
    playwrightRuntimeDirectory: hasRuntime ? runtime : undefined,
    chromiumArgs: roots.isCodexSandbox ? ["--single-process"] : [],
  });
  writeFileSync(join(options.outputDirectory, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
  return ok(report);
}

export function formatCaptureSetupPlan(plan: CaptureSetupPlan, isApplied: boolean): string {
  if (plan.steps.length === 0) return `capture runtime ready in ${plan.runtimeDirectory}; nothing to do`;
  const lines = plan.steps.map((step) => {
    if (step.kind === "create-runtime") return `- create ${step.directory}`;
    if (step.kind === "install-playwright") return `- npm install playwright@${step.version} in ${step.directory}`;
    return `- playwright install chromium: ${step.note}`;
  });
  return `${isApplied ? "applied" : "planned"}:\n${lines.join("\n")}${isApplied ? "" : "\n\nRun `vcr setup capture --yes` to apply."}`;
}

// === PRIVATE HELPERS ===

function installedPlaywrightVersion(runtime: string): string | null {
  const manifestPath = join(runtime, "node_modules/playwright/package.json");
  if (!existsSync(manifestPath)) return null;
  return (JSON.parse(readFileSync(manifestPath, "utf8")) as { version: string }).version;
}

function isChromiumInstalled(runtime: string): boolean {
  if (installedPlaywrightVersion(runtime) === null) return false;
  try {
    const playwright = createRequire(join(runtime, "/"))("playwright") as { chromium: { executablePath(): string } };
    return existsSync(dirname(playwright.chromium.executablePath()));
  } catch {
    return false;
  }
}
