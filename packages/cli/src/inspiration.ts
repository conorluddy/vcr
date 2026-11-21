import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { basename, extname, join, relative } from "node:path";
import { parseVideoBrief, SERIES_BRIEF_FILE, VIDEO_BRIEF_FILE, type SeriesBrief } from "./brief.js";
import { measureFacts, type ToolRunner } from "./inspiration-facts.js";
import { INSPIRATION_ASPECTS, INSPIRATION_PATHS, inspirationFilePath, sha256OfFile, type InspirationAspect, type InspirationItem, type InspirationKind, type InspirationUse } from "./inspiration-record.js";
import { listFilesNamed, listJsonFiles, readJsonFile, writeJsonAtomic } from "./repository.js";
import { fail, ok, type Result } from "./result.types.js";
import { directoryBytes } from "./storage.js";
import { listVideoDirectories } from "./video.js";
import { ensureIgnored, INSPIRATION_FILES_IGNORE_ENTRY } from "./workspace.js";

// The workspace inspiration library (ADR 0011): add, annotate, list, read and remove items.
// Intake copies a local file into the ignored folder, hashes it and measures what a tool can
// (ADR 0012); it never fetches, and it never writes a note the caller did not pass.

// === TYPES ===

/** What a person states about an item. Every field is optional; absent means "leave as it is". */
export interface StatedFields {
  title?: string | undefined;
  note?: string | undefined;
  aspects?: InspirationAspect[] | undefined;
  use?: InspirationUse | undefined;
  rights?: InspirationItem["rights"] | undefined;
  source?: InspirationItem["source"] | undefined;
}

/** Every mutation says what it wrote and what the caller should know. */
export interface Mutation<T> {
  data: T;
  /** Workspace-relative paths written or deleted; empty when nothing changed. */
  changes: string[];
  warnings: string[];
}

export interface AddContext {
  harnessVersion: string;
  now: Date;
  run?: ToolRunner;
}

export interface InspirationFilter {
  kind?: string | undefined;
  aspect?: string | undefined;
  use?: string | undefined;
  isUnannotated?: boolean;
  isUnobserved?: boolean;
}

export interface RemovalPlan {
  id: string;
  deletions: Array<{ path: string; bytes: number }>;
  totalBytes: number;
  /** Briefs that cite the item and will fail validation once it is gone. */
  warnings: string[];
}

// === PUBLIC API ===

export const CONTACT_SHEET_FILE = "contact-sheet.png";

const MEDIA_TYPES: Record<string, { kind: InspirationKind; mediaType: string }> = {
  ".png": { kind: "image", mediaType: "image/png" },
  ".jpg": { kind: "image", mediaType: "image/jpeg" },
  ".jpeg": { kind: "image", mediaType: "image/jpeg" },
  ".webp": { kind: "image", mediaType: "image/webp" },
  ".gif": { kind: "image", mediaType: "image/gif" },
  ".avif": { kind: "image", mediaType: "image/avif" },
  ".heic": { kind: "image", mediaType: "image/heic" },
  ".tif": { kind: "image", mediaType: "image/tiff" },
  ".tiff": { kind: "image", mediaType: "image/tiff" },
  ".bmp": { kind: "image", mediaType: "image/bmp" },
  ".svg": { kind: "image", mediaType: "image/svg+xml" },
  ".mp4": { kind: "video", mediaType: "video/mp4" },
  ".m4v": { kind: "video", mediaType: "video/mp4" },
  ".mov": { kind: "video", mediaType: "video/quicktime" },
  ".webm": { kind: "video", mediaType: "video/webm" },
  ".mkv": { kind: "video", mediaType: "video/x-matroska" },
  ".ttf": { kind: "font", mediaType: "font/ttf" },
  ".otf": { kind: "font", mediaType: "font/otf" },
  ".ttc": { kind: "font", mediaType: "font/collection" },
  ".woff": { kind: "font", mediaType: "font/woff" },
  ".woff2": { kind: "font", mediaType: "font/woff2" },
};

export function loadInspiration(workspaceRoot: string): InspirationItem[] {
  return listJsonFiles(join(workspaceRoot, INSPIRATION_PATHS.items))
    .map((path) => readJsonFile<InspirationItem>(path))
    .flatMap((parsed) => (parsed.ok ? [parsed.value] : []))
    .sort((left, right) => left.id.localeCompare(right.id));
}

export function findInspiration(workspaceRoot: string, id: string): Result<InspirationItem> {
  const path = recordPath(workspaceRoot, id);
  if (!/^[a-z0-9-]+$/.test(id) || !existsSync(path)) return fail("NOT_FOUND", `No inspiration item "${id}". \`vcr inspiration list\` shows the ids in this workspace.`);
  return readJsonFile<InspirationItem>(path);
}

export function filterInspiration(items: InspirationItem[], filter: InspirationFilter): InspirationItem[] {
  return items.filter(
    (item) =>
      (!filter.kind || item.kind === filter.kind) &&
      (!filter.use || item.use === filter.use) &&
      (!filter.aspect || (item.aspects ?? []).includes(filter.aspect as InspirationAspect)) &&
      (!filter.isUnannotated || item.note === undefined) &&
      (!filter.isUnobserved || (item.observations ?? []).length === 0),
  );
}

/** Files a path names: itself, or every supported file beneath a directory. Unsupported files in a directory are returned as skipped. */
export function expandSources(sourcePath: string): Result<{ files: string[]; skipped: string[] }> {
  if (!existsSync(sourcePath)) return fail("NOT_FOUND", `${sourcePath} does not exist. Inspiration takes local files only; save the file first, and pass where it came from with --source.`);
  if (!statSync(sourcePath).isDirectory()) {
    if (kindOfFile(sourcePath)) return ok({ files: [sourcePath], skipped: [] });
    return fail("UNSUPPORTED_FILE", `${basename(sourcePath)} is not an image, video or font VCR recognises (${Object.keys(MEDIA_TYPES).join(" ")}).`);
  }
  const files: string[] = [];
  const skipped: string[] = [];
  const walk = (directory: string): void => {
    for (const entry of readdirSync(directory, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name))) {
      if (entry.name.startsWith(".")) continue;
      const path = join(directory, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (entry.isFile()) (kindOfFile(path) ? files : skipped).push(path);
    }
  };
  walk(sourcePath);
  return ok({ files, skipped });
}

/**
 * Copies one local file into the library, hashes it, measures what a tool can and writes the record.
 * Idempotent on content: the same bytes return the existing item, restoring its copy if it was absent.
 */
export async function addInspirationFile(workspaceRoot: string, sourcePath: string, stated: StatedFields, context: AddContext): Promise<Result<Mutation<InspirationItem>>> {
  const media = kindOfFile(sourcePath);
  if (!media) return fail("UNSUPPORTED_FILE", `${basename(sourcePath)} is not an image, video or font VCR recognises.`);
  const statedError = statedFieldsError(stated.use ?? "inspiration", stated.rights);
  if (statedError) return fail("INVALID_ARGUMENT", statedError);
  const sha256 = sha256OfFile(sourcePath);
  const changes: string[] = [];
  if (ensureIgnored(workspaceRoot, [INSPIRATION_FILES_IGNORE_ENTRY])) changes.push(".gitignore");

  const existing = loadInspiration(workspaceRoot).find((item) => item.file?.sha256 === sha256);
  if (existing) {
    const copiedPath = inspirationFilePath(workspaceRoot, existing)!;
    const warnings = hasStatedFields(stated) ? [`${existing.id} already holds this file, so the flags were ignored. Change what is stated with \`vcr inspiration annotate ${existing.id}\`.`] : [];
    if (!existsSync(copiedPath)) {
      copyInto(sourcePath, copiedPath);
      changes.push(relative(workspaceRoot, copiedPath));
    }
    return ok({ data: existing, changes, warnings });
  }

  const name = basename(sourcePath);
  const id = `${slugify(basename(name, extname(name))) || media.kind}-${sha256.slice(0, 6)}`;
  const item: InspirationItem = {
    schema_version: "1.0.0",
    id,
    kind: media.kind,
    title: stated.title ?? name.slice(0, MAX_TITLE_CHARACTERS),
    ...statedProperties(stated),
    use: stated.use ?? "inspiration",
    file: { name, sha256, bytes: statSync(sourcePath).size, media_type: media.mediaType },
    added_at: context.now.toISOString(),
  };
  const copiedPath = inspirationFilePath(workspaceRoot, item)!;
  copyInto(sourcePath, copiedPath);
  changes.push(relative(workspaceRoot, copiedPath));

  const contactSheetPath = join(workspaceRoot, INSPIRATION_PATHS.files, id, CONTACT_SHEET_FILE);
  const measurement = await measureFacts(media.kind, copiedPath, { harnessVersion: context.harnessVersion, contactSheetPath, ...(context.run ? { run: context.run } : {}) });
  if (measurement.facts && measurement.factsBy) Object.assign(item, { facts: measurement.facts, facts_by: measurement.factsBy });
  if (measurement.hasContactSheet) changes.push(relative(workspaceRoot, contactSheetPath));

  writeJsonAtomic(recordPath(workspaceRoot, id), item);
  changes.push(relative(workspaceRoot, recordPath(workspaceRoot, id)));
  return ok({ data: item, changes, warnings: [...measurement.warnings, ...rightsWarnings(item)] });
}

/** A named colour set: values as given, no file and no facts. Idempotent on title and values. */
export function addColourSet(workspaceRoot: string, colours: string[], stated: StatedFields, now: Date): Result<Mutation<InspirationItem>> {
  if (!stated.title) return fail("INVALID_ARGUMENT", "A colour set needs --title, which also gives it its id.");
  const invalid = colours.filter((colour) => !HEX_COLOUR.test(colour));
  if (colours.length === 0 || invalid.length > 0) return fail("INVALID_ARGUMENT", `--colours takes comma-separated hex values such as "#0B1F3A,#F2A33A"${invalid.length > 0 ? `; not ${invalid.join(", ")}` : ""}.`);
  const statedError = statedFieldsError(stated.use ?? "inspiration", stated.rights);
  if (statedError) return fail("INVALID_ARGUMENT", statedError);
  const id = slugify(stated.title);
  if (!id) return fail("INVALID_ARGUMENT", `The title "${stated.title}" has no letters or digits to make an id from.`);
  const path = recordPath(workspaceRoot, id);
  if (existsSync(path)) {
    const existing = readJsonFile<InspirationItem>(path);
    if (!existing.ok) return existing;
    if (existing.value.kind === "colours" && existing.value.colours?.join(",").toLowerCase() === colours.join(",").toLowerCase()) return ok({ data: existing.value, changes: [], warnings: [] });
    return fail("CONFLICT", `${id} already exists with different contents. Choose another --title, or \`vcr inspiration remove ${id}\` first.`);
  }
  const item: InspirationItem = { schema_version: "1.0.0", id, kind: "colours", title: stated.title, ...statedProperties(stated), use: stated.use ?? "inspiration", colours, added_at: now.toISOString() };
  writeJsonAtomic(path, item);
  return ok({ data: item, changes: [relative(workspaceRoot, path)], warnings: rightsWarnings(item) });
}

/** Sets or changes what a person stated. Never touches the file, facts or observations. */
export function annotateInspiration(workspaceRoot: string, id: string, stated: StatedFields): Result<Mutation<InspirationItem>> {
  const found = findInspiration(workspaceRoot, id);
  if (!found.ok) return found;
  if (!hasStatedFields(stated)) return fail("INVALID_ARGUMENT", "annotate needs at least one of --note, --aspect, --use, --title, --rights, --attribution, --source, --creator or --accessed.");
  const source = stated.source ? { ...found.value.source, ...stated.source } : found.value.source;
  const updated: InspirationItem = { ...found.value, ...statedProperties({ ...stated, source }), ...(stated.title ? { title: stated.title } : {}), ...(stated.use ? { use: stated.use } : {}) };
  const statedError = statedFieldsError(updated.use, updated.rights);
  if (statedError) return fail("INVALID_ARGUMENT", statedError);
  if (JSON.stringify(updated) === JSON.stringify(found.value)) return ok({ data: found.value, changes: [], warnings: [] });
  writeJsonAtomic(recordPath(workspaceRoot, id), updated);
  return ok({ data: updated, changes: [relative(workspaceRoot, recordPath(workspaceRoot, id))], warnings: rightsWarnings(updated) });
}

/** What removing an item would delete: its record and its copied files. Nothing else in the workspace. */
export function planRemoveInspiration(workspaceRoot: string, id: string): Result<RemovalPlan> {
  const found = findInspiration(workspaceRoot, id);
  if (!found.ok) return found;
  const paths = [recordPath(workspaceRoot, id), join(workspaceRoot, INSPIRATION_PATHS.files, id)].filter((path) => existsSync(path));
  const deletions = paths.map((path) => ({ path, bytes: directoryBytes(path) }));
  const warnings = briefsCiting(workspaceRoot, id).map((file) => `${file} cites ${id}; remove the citation or \`vcr validate\` will fail.`);
  return ok({ id, deletions, totalBytes: deletions.reduce((sum, deletion) => sum + deletion.bytes, 0), warnings });
}

/** Deletes exactly the planned paths. Idempotent: a path already gone is skipped. */
export function applyRemoveInspiration(plan: RemovalPlan): RemovalPlan {
  const applied = plan.deletions.filter((deletion) => existsSync(deletion.path));
  for (const deletion of applied) rmSync(deletion.path, { recursive: true, force: true });
  return { ...plan, deletions: applied, totalBytes: applied.reduce((sum, deletion) => sum + deletion.bytes, 0) };
}

export function parseAspects(value: string): Result<InspirationAspect[]> {
  const aspects = [...new Set(value.split(",").map((aspect) => aspect.trim()).filter(Boolean))];
  const unknown = aspects.filter((aspect) => !(INSPIRATION_ASPECTS as readonly string[]).includes(aspect));
  if (aspects.length === 0 || unknown.length > 0) return fail("INVALID_ARGUMENT", `--aspect takes one or more of ${INSPIRATION_ASPECTS.join(", ")}, comma-separated${unknown.length > 0 ? `; not ${unknown.join(", ")}` : ""}.`);
  return ok(aspects as InspirationAspect[]);
}

export function recordPath(workspaceRoot: string, id: string): string {
  return join(workspaceRoot, INSPIRATION_PATHS.items, `${id}.json`);
}

// === PRIVATE HELPERS ===

const HEX_COLOUR = /^#(?:[0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
const MAX_TITLE_CHARACTERS = 100;
const MAX_SLUG_CHARACTERS = 48;

function kindOfFile(filePath: string): { kind: InspirationKind; mediaType: string } | undefined {
  return MEDIA_TYPES[extname(filePath).toLowerCase()];
}

function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, MAX_SLUG_CHARACTERS)
    .replace(/^-+|-+$/g, "");
}

function copyInto(sourcePath: string, destinationPath: string): void {
  mkdirSync(join(destinationPath, ".."), { recursive: true });
  copyFileSync(sourcePath, destinationPath);
}

function hasStatedFields(stated: StatedFields): boolean {
  return Object.values(stated).some((value) => value !== undefined);
}

/** Only the optional stated properties that were given, in record order. */
function statedProperties(stated: StatedFields): Partial<InspirationItem> {
  return {
    ...(stated.note !== undefined ? { note: stated.note } : {}),
    ...(stated.aspects !== undefined ? { aspects: stated.aspects } : {}),
    ...(stated.rights !== undefined ? { rights: stated.rights } : {}),
    ...(stated.source !== undefined && Object.keys(stated.source).length > 0 ? { source: stated.source } : {}),
  };
}

function statedFieldsError(use: InspirationUse, rights: InspirationItem["rights"] | undefined): string | undefined {
  if (use === "asset" && rights === undefined) return 'An asset may appear in output, so it needs --rights "<where permission comes from>". Pass --rights unknown to record that honestly; validation then fails until it is settled.';
  return undefined;
}

function rightsWarnings(item: InspirationItem): string[] {
  const warnings: string[] = [];
  if (item.use === "asset" && item.rights === "unknown") warnings.push(`rights are unknown, so ${item.id} fails validation as an asset and must not appear in output.`);
  return warnings;
}

/** Workspace-relative paths of the series and video briefs that cite an item. */
function briefsCiting(workspaceRoot: string, id: string): string[] {
  const citing: string[] = [];
  for (const path of listFilesNamed(join(workspaceRoot, "projects"), SERIES_BRIEF_FILE)) {
    const brief = readJsonFile<SeriesBrief>(path);
    if (brief.ok && (brief.value.inspiration ?? []).some((cited) => cited.id === id)) citing.push(relative(workspaceRoot, path));
  }
  for (const { directory } of listVideoDirectories(workspaceRoot)) {
    const path = join(directory, VIDEO_BRIEF_FILE);
    if (!existsSync(path)) continue;
    const brief = parseVideoBrief(readFileSync(path, "utf8"));
    const cited = brief.ok ? brief.value.frontMatter["inspiration"] : undefined;
    if (Array.isArray(cited) && cited.includes(id)) citing.push(relative(workspaceRoot, path));
  }
  return citing;
}
