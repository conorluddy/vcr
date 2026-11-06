// `vcr lint`: layout checks on browser scenes before capture. Thresholds come from
// references/typography/rules.json under the harness root; see packages/lint.
import { existsSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { lintScenes, loadSafeZone, type LintFinding, type LintReport, type SafeZone } from "@vcr/lint";
import { prepareBrowserRuntime } from "./capture.js";
import { fail, ok, type Result } from "./result.types.js";
import type { Roots } from "./roots.js";

// === TYPES ===

export interface LintCommandOptions {
  /** A scene page, or a directory whose *.html files are each linted. */
  target: string;
  /** A preset name from rules.json `safe_zones`, or "none". */
  safeZoneName: string;
  width: number | undefined;
  height: number | undefined;
  times: number[] | undefined;
  useMarkers: boolean;
  samples: number;
  fps: number;
}

export const DEFAULT_LINT_SAMPLES = 8;

// === PUBLIC API ===

export async function runLint(roots: Roots, options: LintCommandOptions): Promise<Result<LintReport>> {
  const sceneFiles = listScenes(resolve(options.target));
  if (!sceneFiles.ok) return sceneFiles;
  let safeZone: SafeZone | null = null;
  if (options.safeZoneName !== "none") {
    const loaded = loadSafeZone(roots.harness, options.safeZoneName);
    if (!loaded.ok) return loaded;
    safeZone = loaded.value;
  }
  const width = options.width ?? safeZone?.width;
  const height = options.height ?? safeZone?.height;
  if (width === undefined || height === undefined) return fail("INVALID_ARGUMENT", "--safe-zone none needs --width and --height; a preset supplies its own canvas size.");
  const browser = prepareBrowserRuntime(roots);
  if (!browser.ok) return browser;
  const report = await lintScenes(sceneFiles.value, { width, height, safeZone, times: options.times, useMarkers: options.useMarkers, samples: options.samples, fps: options.fps, ...browser.value }, process.cwd());
  return ok(report);
}

export function formatLintReport(report: LintReport): string {
  const lines = report.findings.map(formatFinding);
  for (const entry of report.unableToAssess) lines.push(`${entry.scene}: unable to assess: ${entry.reason}`);
  const sampleCount = Object.values(report.samples).reduce((total, times) => total + times.length, 0);
  lines.push(`${report.findings.length} findings in ${report.scenes.length} scene${report.scenes.length === 1 ? "" : "s"} (${sampleCount} samples)${report.unableToAssess.length > 0 ? `; ${report.unableToAssess.length} unable to assess` : ""}`);
  return lines.join("\n");
}

/** `--at 1.5,3` as seconds; undefined when absent, an error when any entry is not a non-negative number. */
export function parseSampleTimes(value: string | undefined): Result<number[] | undefined> {
  if (value === undefined) return ok(undefined);
  const times = value.split(",").map((entry) => Number(entry.trim()));
  if (times.length === 0 || !times.every((time) => Number.isFinite(time) && time >= 0)) return fail("INVALID_ARGUMENT", `--at takes comma-separated seconds, e.g. --at 0.5,2.9; got "${value}".`);
  return ok(times);
}

// === PRIVATE HELPERS ===

function formatFinding(finding: LintFinding): string {
  const unverified = finding.verified ? "" : " [unverified preset]";
  const text = finding.text ? ` "${finding.text}"` : "";
  return `${finding.scene} t=${finding.t}s ${finding.rule}${unverified} ${finding.selector}${text}: ${finding.problem}`;
}

function listScenes(target: string): Result<string[]> {
  if (!existsSync(target)) return fail("SCENE_NOT_FOUND", `${target} does not exist.`);
  if (!statSync(target).isDirectory()) return ok([target]);
  const scenes = readdirSync(target).filter((entry) => entry.endsWith(".html")).sort().map((entry) => join(target, entry));
  if (scenes.length === 0) return fail("SCENE_NOT_FOUND", `${target} holds no .html scenes; pass a scene file or a directory of them.`);
  return ok(scenes);
}
