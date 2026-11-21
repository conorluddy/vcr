import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { addColourSet, addInspirationFile, annotateInspiration, applyRemoveInspiration, CONTACT_SHEET_FILE, expandSources, filterInspiration, findInspiration, loadInspiration, parseAspects, planRemoveInspiration, type Mutation, type StatedFields } from "./inspiration.js";
import type { ToolRunner } from "./inspiration-facts.js";
import { DEFAULT_ANALYST_AGENT, observeInspiration } from "./inspiration-observe.js";
import { INSPIRATION_ASPECTS, INSPIRATION_PATHS, inspirationFilePath, type InspirationItem } from "./inspiration-record.js";
import { fail, ok, type Result } from "./result.types.js";
import type { CommandOutput } from "./review-commands.js";
import { displayPath, formatBytes } from "./storage.js";

// `vcr inspiration …`: the workspace's reference library (ADR 0011). Each subcommand returns what
// to print; index.ts owns printing and exit codes. Output keeps stated, measured and judged apart
// and in that order (ADR 0012).

// === TYPES ===

type Flags = Record<string, string | true>;

export interface InspirationCommandContext {
  workspaceRoot: string;
  /** Resolves relative file arguments. */
  cwd: string;
  harnessVersion: string;
  now: Date;
  run?: ToolRunner;
}

// === PUBLIC API ===

export async function runInspirationCommand(subcommand: string, targets: string[], flags: Flags, context: InspirationCommandContext): Promise<Result<CommandOutput>> {
  if (subcommand === "add") return runAdd(targets, flags, context);
  if (subcommand === "list") return runList(flags, context.workspaceRoot);
  const id = targets[0];
  if (!id) return fail("INVALID_ARGUMENT", `inspiration ${subcommand} needs an item id; \`vcr inspiration list\` shows them.`);
  if (subcommand === "show") {
    const found = findInspiration(context.workspaceRoot, id);
    if (!found.ok) return found;
    const located = locate(found.value, context.workspaceRoot);
    return ok({ json: { ...found.value, ...located }, text: formatInspirationItem(found.value, located) });
  }
  if (subcommand === "annotate") {
    const stated = statedFromFlags(flags);
    if (!stated.ok) return stated;
    const outcome = annotateInspiration(context.workspaceRoot, id, stated.value);
    if (!outcome.ok) return outcome;
    return ok(mutationOutput(withNoteReminder(outcome.value, [outcome.value.data]), outcome.value.changes.length > 0 ? `annotated ${id}` : `${id} already says this; nothing written`));
  }
  if (subcommand === "observe") {
    const aspect = text(flags["aspect"]);
    const observed = text(flags["observed"]);
    const model = text(flags["model"]);
    if (!aspect || !observed || !model) return fail("INVALID_ARGUMENT", 'inspiration observe needs --aspect <aspect>, --observed "<what is there>" and --model <the model observing>.');
    const outcome = observeInspiration(context.workspaceRoot, id, { aspect, observed, inferred: text(flags["inferred"]), span: text(flags["span"]), agent: text(flags["agent"]) ?? DEFAULT_ANALYST_AGENT, model }, context.now);
    if (!outcome.ok) return outcome;
    return ok(mutationOutput(outcome.value, outcome.value.changes.length > 0 ? `recorded a ${aspect} observation on ${id}, judged by ${model}` : `${id} already holds this observation; nothing written`));
  }
  if (subcommand === "remove") {
    const plan = planRemoveInspiration(context.workspaceRoot, id);
    if (!plan.ok) return plan;
    const isApplying = flags["yes"] === true;
    const result = isApplying ? applyRemoveInspiration(plan.value) : plan.value;
    const rows = result.deletions.map((deletion) => `${formatBytes(deletion.bytes).padStart(9)}  ${displayPath(deletion.path, context.workspaceRoot)}`);
    const text = [`${isApplying ? "deleted" : "would delete"} ${id}, ${formatBytes(result.totalBytes)}:`, ...rows, ...result.warnings.map((warning) => `warning: ${warning}`), ...(isApplying ? [] : ["", "Run again with --yes to apply."])].join("\n");
    return ok({ json: { applied: isApplying, data: { id }, changes: isApplying ? result.deletions.map((deletion) => displayPath(deletion.path, context.workspaceRoot)) : [], warnings: result.warnings, deletions: result.deletions, totalBytes: result.totalBytes }, text });
  }
  return fail("INVALID_ARGUMENT", "Use vcr inspiration add, annotate, observe, list, show or remove.");
}

/** One line per item: what a reader needs to decide whether to open it. */
export function formatInspirationLine(item: InspirationItem): string {
  const aspects = (item.aspects ?? []).join(",") || "-";
  const observed = (item.observations ?? []).length;
  return `${item.id}  ${item.kind.padEnd(7)}  ${item.use.padEnd(11)}  ${aspects}  ${item.title}: ${item.note ?? "(no note)"}${observed > 0 ? `  [${observed} observed]` : ""}`;
}

/** Stated first, then measured, then judged, each labelled with its source; then where the file is. */
export function formatInspirationItem(item: InspirationItem, located: { file_path?: string; is_file_present?: boolean; contact_sheet_path?: string }): string {
  const lines = [`${item.id}  ${item.kind}  ${item.use}`, `title: ${item.title}`, `note (stated): ${item.note ?? "none. Ask the user what they like in it; observations do not stand in for it."}`];
  if (item.aspects?.length) lines.push(`take from it (stated): ${item.aspects.join(", ")}`);
  if (item.rights) lines.push(`rights (stated): ${item.rights === "unknown" ? "unknown" : `${item.rights.evidence}${item.rights.attribution ? `; attribution: ${item.rights.attribution}` : ""}`}`);
  if (item.source) lines.push(`source (stated): ${[item.source.locator, item.source.creator && `by ${item.source.creator}`, item.source.accessed && `accessed ${item.source.accessed}`].filter(Boolean).join(", ")}`);
  if (item.colours) lines.push(`colours (as given): ${item.colours.join(" ")}`);
  if (item.facts && item.facts_by) {
    lines.push("", `measured by ${item.facts_by.tool} ${item.facts_by.version}:`);
    const { dominant_colours: dominantColours, ...scalars } = item.facts;
    for (const [name, value] of Object.entries(scalars)) lines.push(`  ${name}: ${String(value)}`);
    if (dominantColours) lines.push(`  dominant_colours: ${dominantColours.map((colour) => `${colour.hex} ${Math.round(colour.share * 100)}%`).join(", ")}`);
  }
  for (const observation of item.observations ?? []) {
    lines.push("", `judged by ${observation.by.model} (${observation.by.agent}, ${observation.at.slice(0, 10)}), ${observation.aspect}${observation.span ? ` ${observation.span}` : ""}:`, `  observed: ${observation.observed}`);
    if (observation.inferred) lines.push(`  inferred: ${observation.inferred}`);
  }
  if (located.file_path) lines.push("", `file: ${located.file_path}${located.is_file_present ? "" : " (absent: copied files are git-ignored; add the original again to restore it)"}`);
  if (located.contact_sheet_path) lines.push(`contact sheet: ${located.contact_sheet_path}`);
  return lines.join("\n");
}

// === PRIVATE HELPERS ===

async function runAdd(targets: string[], flags: Flags, context: InspirationCommandContext): Promise<Result<CommandOutput>> {
  const stated = statedFromFlags(flags);
  if (!stated.ok) return stated;
  const colours = text(flags["colours"]);
  if (colours !== undefined) {
    if (targets.length > 0) return fail("INVALID_ARGUMENT", "--colours adds a colour set with no file; add files in a separate call.");
    const outcome = addColourSet(context.workspaceRoot, colours.split(",").map((colour) => colour.trim()).filter(Boolean), stated.value, context.now);
    if (!outcome.ok) return outcome;
    return ok(mutationOutput(withNoteReminder({ ...outcome.value, data: [outcome.value.data] }, [outcome.value.data]), outcome.value.changes.length > 0 ? `added ${formatInspirationLine(outcome.value.data)}` : `${outcome.value.data.id} already holds these colours; nothing written`));
  }
  if (targets.length === 0) return fail("INVALID_ARGUMENT", 'inspiration add needs a file or directory, or --colours "#0B1F3A,#F2A33A" --title <name>.');
  const files: string[] = [];
  const warnings: string[] = [];
  for (const target of targets) {
    const expanded = expandSources(resolve(context.cwd, target));
    if (!expanded.ok) return expanded;
    files.push(...expanded.value.files);
    if (expanded.value.skipped.length > 0) warnings.push(`skipped ${expanded.value.skipped.length} file${expanded.value.skipped.length === 1 ? "" : "s"} that ${expanded.value.skipped.length === 1 ? "is" : "are"} not an image, video or font: ${expanded.value.skipped.map((path) => displayPath(path, context.cwd)).join(", ")}`);
  }
  if (files.length === 0) return fail("NOT_FOUND", `No image, video or font found in ${targets.join(", ")}.`);
  if (files.length > 1 && (stated.value.note !== undefined || stated.value.title !== undefined)) return fail("INVALID_ARGUMENT", `--note and --title describe one item, and this would add ${files.length}. Add the files, then \`vcr inspiration annotate <id>\` each one.`);

  const added: InspirationItem[] = [];
  const changes: string[] = [];
  const lines: string[] = [];
  for (const file of files) {
    const outcome = await addInspirationFile(context.workspaceRoot, file, stated.value, { harnessVersion: context.harnessVersion, now: context.now, ...(context.run ? { run: context.run } : {}) });
    if (!outcome.ok) return outcome;
    added.push(outcome.value.data);
    changes.push(...outcome.value.changes.filter((change) => !changes.includes(change)));
    warnings.push(...outcome.value.warnings.filter((warning) => !warnings.includes(warning)));
    const isNew = outcome.value.changes.some((change) => change.startsWith(INSPIRATION_PATHS.items));
    lines.push(`${isNew ? "added  " : outcome.value.changes.length > 0 ? "restored" : "present"}  ${formatInspirationLine(outcome.value.data)}${isNew ? `  facts: ${outcome.value.data.facts ? Object.keys(outcome.value.data.facts).join(",") : "none"}` : ""}`);
  }
  return ok(mutationOutput(withNoteReminder({ data: added, changes, warnings }, added), lines.join("\n")));
}

function runList(flags: Flags, workspaceRoot: string): Result<CommandOutput> {
  const limit = flags["limit"] === undefined ? 50 : Number(flags["limit"]);
  const offset = flags["offset"] === undefined ? 0 : Number(flags["offset"]);
  if (!Number.isInteger(limit) || limit < 1 || !Number.isInteger(offset) || offset < 0) return fail("INVALID_ARGUMENT", "--limit must be a whole number of 1 or more and --offset of 0 or more.");
  const aspect = text(flags["aspect"]);
  if (aspect !== undefined && !(INSPIRATION_ASPECTS as readonly string[]).includes(aspect)) return fail("INVALID_ARGUMENT", `--aspect is one of ${INSPIRATION_ASPECTS.join(", ")}.`);
  const kind = text(flags["kind"]);
  if (kind !== undefined && !KINDS.includes(kind)) return fail("INVALID_ARGUMENT", `--kind is one of ${KINDS.join(", ")}.`);
  const use = text(flags["use"]);
  if (use !== undefined && !USES.includes(use)) return fail("INVALID_ARGUMENT", `--use is one of ${USES.join(", ")}.`);
  const all = loadInspiration(workspaceRoot);
  const matching = filterInspiration(all, { kind, aspect, use, isUnannotated: flags["unannotated"] === true, isUnobserved: flags["unobserved"] === true });
  const page = matching.slice(offset, offset + limit);
  const items = page.map((item) => ({ id: item.id, kind: item.kind, title: item.title, use: item.use, aspects: item.aspects ?? [], note: item.note ?? null, observation_count: (item.observations ?? []).length }));
  const shown = `${offset + 1}–${offset + page.length} of ${matching.length}`;
  const footer = matching.length > offset + page.length ? `${shown}; next page: --offset ${offset + page.length}` : shown;
  const empty = all.length === 0 ? "the inspiration library is empty; add a file with `vcr inspiration add <file|dir>`" : "no matching inspiration items";
  return ok({ json: { total: matching.length, offset, limit, items }, text: page.length === 0 ? empty : [...page.map(formatInspirationLine), "", footer].join("\n") });
}

const KINDS = ["image", "video", "font", "colours"];
const USES = ["inspiration", "asset"];

function statedFromFlags(flags: Flags): Result<StatedFields> {
  const stated: StatedFields = {};
  const title = text(flags["title"]);
  const note = text(flags["note"]);
  if (title !== undefined) {
    if (title.length > LIMITS.title) return fail("INVALID_ARGUMENT", `--title is ${title.length} characters; the limit is ${LIMITS.title}.`);
    stated.title = title;
  }
  if (note !== undefined) {
    if (note.length > LIMITS.note) return fail("INVALID_ARGUMENT", `--note is ${note.length} characters; the limit is ${LIMITS.note}. Keep what the user likes most.`);
    stated.note = note;
  }
  const aspect = text(flags["aspect"]);
  if (aspect !== undefined) {
    const aspects = parseAspects(aspect);
    if (!aspects.ok) return aspects;
    stated.aspects = aspects.value;
  }
  const use = text(flags["use"]);
  if (use !== undefined) {
    if (!USES.includes(use)) return fail("INVALID_ARGUMENT", `--use is one of ${USES.join(", ")}.`);
    stated.use = use as "inspiration" | "asset";
  }
  const rights = text(flags["rights"]);
  const attribution = text(flags["attribution"]);
  if (attribution !== undefined && (rights === undefined || rights === "unknown")) return fail("INVALID_ARGUMENT", '--attribution goes with --rights "<evidence>".');
  if (rights !== undefined) stated.rights = rights === "unknown" ? "unknown" : { evidence: rights, ...(attribution ? { attribution } : {}) };
  const accessed = text(flags["accessed"]);
  if (accessed !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(accessed)) return fail("INVALID_ARGUMENT", "--accessed is a date, YYYY-MM-DD.");
  const source = { ...(text(flags["source"]) ? { locator: text(flags["source"])! } : {}), ...(text(flags["creator"]) ? { creator: text(flags["creator"])! } : {}), ...(accessed ? { accessed } : {}) };
  if (Object.keys(source).length > 0) stated.source = source;
  return ok(stated);
}

const LIMITS = { title: 100, note: 400 } as const;

function locate(item: InspirationItem, workspaceRoot: string): { file_path?: string; is_file_present?: boolean; contact_sheet_path?: string } {
  const filePath = inspirationFilePath(workspaceRoot, item);
  if (!filePath) return {};
  const contactSheetPath = join(workspaceRoot, INSPIRATION_PATHS.files, item.id, CONTACT_SHEET_FILE);
  return { file_path: filePath, is_file_present: existsSync(filePath), ...(existsSync(contactSheetPath) ? { contact_sheet_path: contactSheetPath } : {}) };
}

/** One reminder however many items lack a note: only the user can say what they like, so the agent is told to ask. */
function withNoteReminder<T>(mutation: Mutation<T>, items: InspirationItem[]): Mutation<T> {
  const unannotated = items.filter((item) => item.note === undefined);
  if (unannotated.length === 0) return mutation;
  const subject = unannotated.length === 1 ? `${unannotated[0]!.id} has no note` : `${unannotated.length} items have no note (\`vcr inspiration list --unannotated\`)`;
  return { ...mutation, warnings: [...mutation.warnings, `${subject}. Ask the user what they like in each, then \`vcr inspiration annotate <id> --note "<their words>"\`; do not write one for them.`] };
}

function mutationOutput(mutation: Mutation<unknown>, summary: string): CommandOutput {
  return { json: mutation, text: [summary, ...mutation.warnings.map((warning) => `warning: ${warning}`)].join("\n") };
}

function text(value: string | true | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}
