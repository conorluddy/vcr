import { existsSync, lstatSync, readdirSync, rmSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";
import { readJsonFile } from "./repository.js";
import { fail, ok, type Result } from "./result.types.js";
import { latestManifest, readVideoReview, REVIEW_PATHS, type VideoReview } from "./review.js";
import { WORKSPACE_MARKER } from "./roots.js";
import { listVideoDirectories, resolveVideo } from "./video.js";

// Every byte VCR writes is in one of five classes (plugin PRD §6.5). Output, cache, proxies and
// runtime are regenerable and cleared plan-then-apply; evidence is committed and only ever pruned,
// never down to less than its manifest. Source, findings, approvals and briefs are never touched (ST-04).

// === TYPES ===

export type StorageClass = "output" | "cache" | "evidence" | "proxies" | "runtime";
export type ClearableClass = Exclude<StorageClass, "evidence">;

export interface StorageEntry {
  storageClass: StorageClass;
  path: string;
  bytes: number;
  videoId?: string;
  renderId?: string;
}

export interface StorageReport {
  totals: Record<StorageClass, number>;
  /** Largest first, one row per render (output, evidence) or per class root (cache, proxies, runtime). */
  entries: StorageEntry[];
  warnings: string[];
}

export interface StorageBudgets {
  outputWarnBytes: number;
  evidenceWarnBytes: number;
}

export interface StorageRoots {
  workspace: string;
  machine: string;
}

export interface ClearOptions {
  videoId?: string | undefined;
  renderId?: string | undefined;
  olderThanDays?: number | undefined;
  keepLatest?: number | undefined;
  now: Date;
}

export interface DeletionPlan {
  storageClass: StorageClass;
  deletions: Array<{ path: string; bytes: number }>;
  totalBytes: number;
}

export const CLEARABLE_CLASSES: ClearableClass[] = ["output", "cache", "proxies", "runtime"];
export const DEFAULT_BUDGETS: StorageBudgets = { outputWarnBytes: 5 * 1024 ** 3, evidenceWarnBytes: 2 * 1024 ** 2 };
const KEPT_WHEN_PRUNED = new Set([REVIEW_PATHS.manifestFile, "contact-sheet.png", "contact-sheet.jpg", "contact-sheet.webp"]);

// === PUBLIC API ===

export function storageReport(roots: StorageRoots, budgets: StorageBudgets, videoId?: string): StorageReport {
  const entries: StorageEntry[] = [];
  const videos = listVideoDirectories(roots.workspace).filter((video) => !videoId || video.videoId === videoId);
  for (const { videoId: id, directory } of videos) {
    for (const render of renderDirectories(join(roots.workspace, "output", ...id.split("/")))) entries.push({ storageClass: "output", path: render.path, bytes: directoryBytes(render.path), videoId: id, renderId: render.renderId });
    for (const render of renderDirectories(join(directory, REVIEW_PATHS.renders))) entries.push({ storageClass: "evidence", path: render.path, bytes: directoryBytes(render.path), videoId: id, renderId: render.renderId });
  }
  if (!videoId) {
    const outputRoot = join(roots.workspace, "output");
    const attributed = entries.filter((entry) => entry.storageClass === "output").reduce((sum, entry) => sum + entry.bytes, 0);
    const unattributed = directoryBytes(outputRoot) - attributed;
    if (unattributed > 0) entries.push({ storageClass: "output", path: outputRoot, bytes: unattributed });
    for (const [storageClass, path] of classRoots(roots)) if (storageClass !== "output") entries.push({ storageClass, path, bytes: directoryBytes(path) });
  }
  const totals: Record<StorageClass, number> = { output: 0, cache: 0, evidence: 0, proxies: 0, runtime: 0 };
  for (const entry of entries) totals[entry.storageClass] += entry.bytes;
  entries.sort((left, right) => right.bytes - left.bytes);
  return { totals, entries: entries.filter((entry) => entry.bytes > 0), warnings: budgetWarnings(entries, totals, budgets, videoId !== undefined) };
}

/** Budgets from vcr.json `storage`, falling back to the PRD defaults. */
export function loadBudgets(workspaceRoot: string): StorageBudgets {
  const marker = readJsonFile<{ storage?: { output_warn_bytes?: number; evidence_warn_bytes?: number } }>(join(workspaceRoot, WORKSPACE_MARKER));
  const storage = marker.ok ? marker.value.storage : undefined;
  return { outputWarnBytes: storage?.output_warn_bytes ?? DEFAULT_BUDGETS.outputWarnBytes, evidenceWarnBytes: storage?.evidence_warn_bytes ?? DEFAULT_BUDGETS.evidenceWarnBytes };
}

/** What `vcr storage clear` would delete. Only regenerable classes; filters apply to output renders. */
export function planClear(roots: StorageRoots, storageClass: string, options: ClearOptions): Result<DeletionPlan> {
  if (storageClass === "evidence") return fail("INVALID_ARGUMENT", "Evidence is committed and not regenerable, so it is never cleared. Use `vcr storage prune evidence --video <id> --keep <n>`.");
  if (!CLEARABLE_CLASSES.includes(storageClass as ClearableClass)) return fail("INVALID_ARGUMENT", `Unknown storage class "${storageClass}". Clearable: ${CLEARABLE_CLASSES.join(", ")}.`);
  const root = classRoots(roots).get(storageClass as ClearableClass)!;
  const hasRenderFilters = options.videoId !== undefined || options.renderId !== undefined || options.olderThanDays !== undefined || options.keepLatest !== undefined;
  if (storageClass !== "output" && hasRenderFilters) return fail("INVALID_ARGUMENT", "--video, --render, --older-than and --keep-latest select renders, so they apply only to output.");

  let paths: string[];
  if (storageClass !== "output") paths = childPaths(root);
  else if (!hasRenderFilters) paths = childPaths(root);
  else {
    const videos = options.videoId ? [resolveVideo(roots.workspace, options.videoId)] : listVideoDirectories(roots.workspace).map((video) => ok(video));
    paths = [];
    for (const video of videos) {
      if (!video.ok) return video;
      const renders = renderDirectories(join(root, ...video.value.videoId.split("/"))).sort((left, right) => left.renderId.localeCompare(right.renderId));
      const kept = new Set(options.keepLatest !== undefined ? renders.slice(-options.keepLatest).map((render) => render.renderId) : []);
      const cutoffMs = options.olderThanDays !== undefined ? options.now.getTime() - options.olderThanDays * 86_400_000 : undefined;
      for (const render of renders) {
        if (options.renderId && render.renderId !== options.renderId) continue;
        if (kept.has(render.renderId)) continue;
        if (cutoffMs !== undefined && lstatSync(render.path).mtimeMs > cutoffMs) continue;
        paths.push(render.path);
      }
    }
  }
  return ok(toPlan(storageClass as ClearableClass, paths.filter((path) => isSafeToClear(path, root, roots.workspace))));
}

/**
 * Reduces older retained revisions to manifest plus contact sheet (ST-05). Keeps the newest `keep`
 * revisions whole, and never touches the latest, an approved one, or one an open finding cites.
 */
export function planPruneEvidence(roots: StorageRoots, videoId: string, keep: number): Result<DeletionPlan> {
  const video = resolveVideo(roots.workspace, videoId);
  if (!video.ok) return video;
  const review = readVideoReview(video.value.directory, roots.workspace);
  const protectedIds = protectedRenderIds(review);
  const renders = renderDirectories(join(video.value.directory, REVIEW_PATHS.renders)).sort((left, right) => left.renderId.localeCompare(right.renderId));
  const prunable = renders.slice(0, Math.max(0, renders.length - keep)).filter((render) => !protectedIds.has(render.renderId));
  const paths = prunable.flatMap((render) => childPaths(render.path).filter((path) => !KEPT_WHEN_PRUNED.has(relative(render.path, path))));
  return ok(toPlan("evidence", paths));
}

/** Deletes exactly the planned paths. Idempotent: a path already gone is skipped. */
export function applyPlan(plan: DeletionPlan): DeletionPlan {
  const applied = plan.deletions.filter((deletion) => existsSync(deletion.path) || isSymbolicLink(deletion.path));
  for (const deletion of applied) rmSync(deletion.path, { recursive: true, force: true });
  return { ...plan, deletions: applied, totalBytes: applied.reduce((sum, deletion) => sum + deletion.bytes, 0) };
}

export function formatStorageReport(report: StorageReport, offset: number, limit: number): string {
  const lines = [`totals: ${Object.entries(report.totals).map(([storageClass, bytes]) => `${storageClass} ${formatBytes(bytes)}`).join(", ")}`];
  const page = report.entries.slice(offset, offset + limit);
  for (const entry of page) lines.push(`${formatBytes(entry.bytes).padStart(9)}  ${entry.storageClass.padEnd(8)}  ${entry.videoId ? `${entry.videoId} ${entry.renderId ?? ""}`.trim() : entry.path}`);
  if (report.entries.length > offset + page.length) lines.push(`${offset + 1}–${offset + page.length} of ${report.entries.length}; next page: --offset ${offset + page.length}`);
  lines.push(...report.warnings.map((warning) => `warning: ${warning}`));
  return lines.join("\n");
}

export function formatPlan(plan: DeletionPlan, isApplied: boolean, workspaceRoot: string): string {
  if (plan.deletions.length === 0) return `${plan.storageClass}: nothing to ${isApplied ? "delete" : "clear"}`;
  const rows = plan.deletions.map((deletion) => `${formatBytes(deletion.bytes).padStart(9)}  ${displayPath(deletion.path, workspaceRoot)}`);
  return [`${isApplied ? "deleted" : "would delete"} ${plan.deletions.length} path${plan.deletions.length === 1 ? "" : "s"}, ${formatBytes(plan.totalBytes)}:`, ...rows, ...(isApplied ? [] : ["", "Run again with --yes to apply."])].join("\n");
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[unit]}`;
}

// === PRIVATE HELPERS ===

function classRoots(roots: StorageRoots): Map<ClearableClass, string> {
  return new Map<ClearableClass, string>([
    ["output", join(roots.workspace, "output")],
    ["cache", join(roots.workspace, ".cache")],
    ["proxies", join(roots.machine, "proxies")],
    ["runtime", join(roots.machine, "runtime")],
  ]);
}

/** The last guard before deletion: inside the class root, and never inside a project, a review directory or the workspace marker. */
function isSafeToClear(path: string, classRoot: string, workspaceRoot: string): boolean {
  const absolute = resolve(path);
  if (!isInside(absolute, resolve(classRoot)) || absolute === resolve(classRoot)) return false;
  const protectedRoots = [join(workspaceRoot, "projects"), join(workspaceRoot, WORKSPACE_MARKER)].map((entry) => resolve(entry));
  return !protectedRoots.some((protectedRoot) => isInside(absolute, protectedRoot) || isInside(protectedRoot, absolute)) && !absolute.split(sep).includes(REVIEW_PATHS.directory);
}

function protectedRenderIds(review: VideoReview): Set<string> {
  const ids = new Set<string>();
  const latest = latestManifest(review);
  if (latest) ids.add(latest.render_id);
  for (const { approval } of review.approvals) if (approval.decision === "approved") ids.add(approval.render_id);
  for (const { finding } of review.findings) {
    if (finding.status !== "open" && finding.status !== "addressed") continue;
    ids.add(finding.render_id);
    if (finding.resolution) ids.add(finding.resolution.render_id);
  }
  return ids;
}

function budgetWarnings(entries: StorageEntry[], totals: Record<StorageClass, number>, budgets: StorageBudgets, isFiltered: boolean): string[] {
  const warnings: string[] = [];
  if (!isFiltered && totals.output > budgets.outputWarnBytes) warnings.push(`output is ${formatBytes(totals.output)}, over its ${formatBytes(budgets.outputWarnBytes)} budget; vcr storage clear output --keep-latest 1 shows what it would free`);
  const evidenceByVideo = new Map<string, number>();
  for (const entry of entries) if (entry.storageClass === "evidence" && entry.videoId) evidenceByVideo.set(entry.videoId, (evidenceByVideo.get(entry.videoId) ?? 0) + entry.bytes);
  for (const [videoId, bytes] of evidenceByVideo) if (bytes > budgets.evidenceWarnBytes) warnings.push(`${videoId} evidence is ${formatBytes(bytes)}, over its ${formatBytes(budgets.evidenceWarnBytes)} budget; vcr storage prune evidence --video ${videoId} --keep 3`);
  return warnings;
}

function renderDirectories(directory: string): Array<{ renderId: string; path: string }> {
  if (!existsSync(directory)) return [];
  return readdirSync(directory).filter((entry) => /^r-\d{8}T\d{6}-[0-9a-f]{7}$/.test(entry)).map((renderId) => ({ renderId, path: join(directory, renderId) }));
}

function childPaths(directory: string): string[] {
  return existsSync(directory) ? readdirSync(directory).map((entry) => join(directory, entry)) : [];
}

function toPlan(storageClass: StorageClass, paths: string[]): DeletionPlan {
  const deletions = paths.map((path) => ({ path, bytes: directoryBytes(path) })).sort((left, right) => right.bytes - left.bytes);
  return { storageClass, deletions, totalBytes: deletions.reduce((sum, deletion) => sum + deletion.bytes, 0) };
}

/** Sums file sizes without following symbolic links, so a linked directory is never counted or crossed. */
function directoryBytes(path: string): number {
  if (!existsSync(path) && !isSymbolicLink(path)) return 0;
  const stats = lstatSync(path);
  if (!stats.isDirectory()) return stats.isFile() ? stats.size : 0;
  return readdirSync(path).reduce((sum, entry) => sum + directoryBytes(join(path, entry)), 0);
}

function isSymbolicLink(path: string): boolean {
  try {
    return lstatSync(path).isSymbolicLink();
  } catch {
    return false;
  }
}

function isInside(path: string, directory: string): boolean {
  return path === directory || path.startsWith(directory + sep);
}

function displayPath(path: string, workspaceRoot: string): string {
  const relativePath = relative(workspaceRoot, path);
  return relativePath.startsWith("..") ? path : relativePath;
}
