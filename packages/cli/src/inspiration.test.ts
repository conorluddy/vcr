import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { runInspirationCommand, type InspirationCommandContext } from "./inspiration-commands.js";
import type { ToolRunner } from "./inspiration-facts.js";
import type { InspirationItem } from "./inspiration-record.js";
import { writeFileAtomic } from "./repository.js";
import { ok } from "./result.types.js";
import { planClear, storageReport, DEFAULT_BUDGETS } from "./storage.js";
import { createFixtureWorkspace, harnessRoot } from "./test-workspace.js";
import { validateWorkspace } from "./validate.js";

const now = new Date("2026-11-21T10:00:00.000Z");
/** Stands in for ImageMagick so the tests need no installed tool. */
const fakeMagick: ToolRunner = async (_command, args) => ok(args.includes("identify") ? "64 48\n" : args.includes("--version") ? "Version: ImageMagick 7.1.2-35" : "  10: (11,31,58) #0B1F3A srgb(11,31,58)\n");

interface Fixture {
  context: InspirationCommandContext;
  sources: string;
  videoDirectory: string;
  run: (subcommand: string, targets?: string[], flags?: Record<string, string | true>) => Promise<{ json: Record<string, any>; text: string }>;
  fails: (subcommand: string, targets?: string[], flags?: Record<string, string | true>) => Promise<string>;
}

/** A workspace and a folder of source files: two posters, a font and a text file. */
function fixture(): Fixture {
  const { root, videoDirectory } = createFixtureWorkspace();
  const sources = mkdtempSync(join(tmpdir(), "vcr-sources-"));
  mkdirSync(join(sources, "saved/nested"), { recursive: true });
  writeFileSync(join(sources, "saved/Poster One.png"), "poster one bytes");
  writeFileSync(join(sources, "saved/nested/poster-two.jpg"), "poster two bytes");
  writeFileSync(join(sources, "saved/readme.txt"), "not media");
  writeFileSync(join(sources, "saved/.DS_Store"), "hidden");
  const context: InspirationCommandContext = { workspaceRoot: root, cwd: sources, harnessVersion: "0.1.0", now, run: fakeMagick };
  const run: Fixture["run"] = async (subcommand, targets = [], flags = {}) => {
    const outcome = await runInspirationCommand(subcommand, targets, flags, context);
    if (!outcome.ok) throw new Error(`${outcome.error.code}: ${outcome.error.message}`);
    return outcome.value as { json: Record<string, any>; text: string };
  };
  const fails: Fixture["fails"] = async (subcommand, targets = [], flags = {}) => {
    const outcome = await runInspirationCommand(subcommand, targets, flags, context);
    return outcome.ok ? "ok" : outcome.error.code;
  };
  return { context, sources, videoDirectory, run, fails };
}

const record = (root: string, id: string) => JSON.parse(readFileSync(join(root, "inspiration/items", `${id}.json`), "utf8")) as InspirationItem;
const errors = (root: string) => validateWorkspace(harnessRoot(), root).diagnostics.filter((diagnostic) => diagnostic.severity === "error");

describe("vcr inspiration", () => {
  test("adding a file copies it, records hash and facts, ignores the copy and validates", async () => {
    const { run, context } = fixture();
    const added = await run("add", ["saved/Poster One.png"], { note: "The headline sits low.", aspect: "composition,typography", source: "https://example.com/poster", creator: "A. Maker" });
    const [item] = added.json["data"] as InspirationItem[];
    expect(item).toMatchObject({ id: expect.stringMatching(/^poster-one-[0-9a-f]{6}$/), kind: "image", title: "Poster One.png", note: "The headline sits low.", aspects: ["composition", "typography"], use: "inspiration", source: { locator: "https://example.com/poster", creator: "A. Maker" }, file: { name: "Poster One.png", bytes: 16, media_type: "image/png" }, facts: { width: 64, height: 48 }, facts_by: { tool: "imagemagick", version: "7.1.2-35" } });
    expect(added.json["changes"]).toEqual([".gitignore", `inspiration/files/${item!.id}/Poster One.png`, `inspiration/items/${item!.id}.json`]);
    expect(added.json["warnings"]).toEqual([]);
    expect(readFileSync(join(context.workspaceRoot, ".gitignore"), "utf8")).toContain("inspiration/files/");
    expect(validateWorkspace(harnessRoot(), context.workspaceRoot).diagnostics).toEqual([]);
  });

  test("adding a directory takes every supported file beneath it, skips the rest, and re-adding changes nothing", async () => {
    const { run } = fixture();
    const first = await run("add", ["saved"]);
    expect((first.json["data"] as InspirationItem[]).map((item) => item.file?.name)).toEqual(["poster-two.jpg", "Poster One.png"]);
    expect(first.json["warnings"]).toEqual([expect.stringContaining("skipped 1 file"), expect.stringContaining("2 items have no note")]);
    const second = await run("add", ["saved"]);
    expect(second.json["changes"]).toEqual([]);
    expect((second.json["data"] as InspirationItem[]).map((item) => item.id)).toEqual((first.json["data"] as InspirationItem[]).map((item) => item.id));
    expect((await run("list")).json["total"]).toBe(2);
  });

  test("re-adding restores a copy that went missing, and ignores flags on an existing item", async () => {
    const { run, context } = fixture();
    const [item] = (await run("add", ["saved/Poster One.png"])).json["data"] as InspirationItem[];
    rmSync(join(context.workspaceRoot, "inspiration/files"), { recursive: true });
    const again = await run("add", ["saved/Poster One.png"], { note: "A different note." });
    expect(again.json["changes"]).toEqual([`inspiration/files/${item!.id}/Poster One.png`]);
    expect(again.json["warnings"]).toContainEqual(expect.stringContaining("flags were ignored"));
    expect(record(context.workspaceRoot, item!.id).note).toBeUndefined();
  });

  test("a note or title cannot be spread across several files, and unsupported or absent sources fail", async () => {
    const { fails } = fixture();
    expect(await fails("add", ["saved"], { note: "All of these." })).toBe("INVALID_ARGUMENT");
    expect(await fails("add", ["saved/readme.txt"])).toBe("UNSUPPORTED_FILE");
    expect(await fails("add", ["https://example.com/poster.png"])).toBe("NOT_FOUND");
    expect(await fails("add")).toBe("INVALID_ARGUMENT");
  });

  test("a colour set is a named record with no file, idempotent on its values", async () => {
    const { run, fails, context } = fixture();
    const flags = { colours: "#0B1F3A, #F2A33A", title: "Harbour night", note: "Navy with one warm accent." };
    const added = await run("add", [], flags);
    expect(added.json["changes"]).toEqual(["inspiration/items/harbour-night.json"]);
    expect(record(context.workspaceRoot, "harbour-night")).toMatchObject({ kind: "colours", colours: ["#0B1F3A", "#F2A33A"], note: "Navy with one warm accent." });
    expect((await run("add", [], flags)).json["changes"]).toEqual([]);
    expect(await fails("add", [], { ...flags, colours: "#000000" })).toBe("CONFLICT");
    expect(await fails("add", [], { colours: "navy", title: "Words" })).toBe("INVALID_ARGUMENT");
    expect(await fails("add", [], { colours: "#000" })).toBe("INVALID_ARGUMENT");
    expect(errors(context.workspaceRoot)).toEqual([]);
  });

  test("annotate changes only what a person stated, and is idempotent", async () => {
    const { run, fails, context } = fixture();
    const [item] = (await run("add", ["saved/Poster One.png"], { source: "https://example.com/poster" })).json["data"] as InspirationItem[];
    const annotated = await run("annotate", [item!.id], { note: "The headline sits low.", aspect: "composition", creator: "A. Maker" });
    expect(annotated.json["changes"]).toEqual([`inspiration/items/${item!.id}.json`]);
    expect(record(context.workspaceRoot, item!.id)).toEqual({ ...item, note: "The headline sits low.", aspects: ["composition"], source: { locator: "https://example.com/poster", creator: "A. Maker" } });
    expect((await run("annotate", [item!.id], { note: "The headline sits low." })).json["changes"]).toEqual([]);
    expect(await fails("annotate", [item!.id])).toBe("INVALID_ARGUMENT");
    expect(await fails("annotate", [item!.id], { aspect: "vibes" })).toBe("INVALID_ARGUMENT");
    expect(await fails("annotate", [item!.id], { note: "x".repeat(401) })).toBe("INVALID_ARGUMENT");
    expect(await fails("annotate", ["not-there"], { note: "x" })).toBe("NOT_FOUND");
  });

  test("an asset needs rights: refused without them, recorded with evidence, and unknown fails validation", async () => {
    const { run, fails, context } = fixture();
    const [item] = (await run("add", ["saved/Poster One.png"], { note: "Ours." })).json["data"] as InspirationItem[];
    expect(await fails("annotate", [item!.id], { use: "asset" })).toBe("INVALID_ARGUMENT");
    expect(await fails("add", ["saved/nested/poster-two.jpg"], { use: "asset" })).toBe("INVALID_ARGUMENT");
    await run("annotate", [item!.id], { use: "asset", rights: "Own work, made in-house.", attribution: "Studio" });
    expect(record(context.workspaceRoot, item!.id)).toMatchObject({ use: "asset", rights: { evidence: "Own work, made in-house.", attribution: "Studio" } });
    expect(errors(context.workspaceRoot)).toEqual([]);
    const unknown = await run("annotate", [item!.id], { rights: "unknown" });
    expect(unknown.json["warnings"]).toEqual([expect.stringContaining("rights are unknown")]);
    expect(errors(context.workspaceRoot)).toEqual([expect.objectContaining({ path: "/rights" })]);
  });

  test("list filters and paginates", async () => {
    const { run, fails } = fixture();
    const [one] = (await run("add", ["saved/Poster One.png"], { note: "Low headline.", aspect: "composition" })).json["data"] as InspirationItem[];
    await run("add", ["saved/nested/poster-two.jpg"], { aspect: "palette" });
    await run("add", [], { colours: "#0B1F3A", title: "Navy" });
    const ids = async (flags: Record<string, string | true>) => ((await run("list", [], flags)).json["items"] as Array<{ id: string }>).map((item) => item.id);
    expect(await ids({})).toHaveLength(3);
    expect(await ids({ aspect: "composition" })).toEqual([one!.id]);
    expect(await ids({ kind: "colours" })).toEqual(["navy"]);
    expect(await ids({ unannotated: true })).toHaveLength(2);
    expect(await ids({ unobserved: true })).toHaveLength(3);
    expect(await ids({ use: "asset" })).toEqual([]);
    const page = await run("list", [], { limit: "1", offset: "1" });
    expect(page.json).toMatchObject({ total: 3, offset: 1, limit: 1 });
    expect(page.text).toContain("2–2 of 3; next page: --offset 2");
    expect(await fails("list", [], { limit: "0" })).toBe("INVALID_ARGUMENT");
    expect(await fails("list", [], { kind: "audio" })).toBe("INVALID_ARGUMENT");
  });

  test("show prints the note, then facts with their tool, then where the file is", async () => {
    const { run, context } = fixture();
    const [item] = (await run("add", ["saved/Poster One.png"], { note: "Low headline." })).json["data"] as InspirationItem[];
    const shown = await run("show", [item!.id]);
    const filePath = join(context.workspaceRoot, "inspiration/files", item!.id, "Poster One.png");
    expect(shown.json).toMatchObject({ id: item!.id, file_path: filePath, is_file_present: true });
    const positions = ["note (stated): Low headline.", "measured by imagemagick 7.1.2-35:", `file: ${filePath}`].map((expected) => shown.text.indexOf(expected));
    expect(positions.every((position) => position >= 0)).toBe(true);
    expect([...positions].sort((left, right) => left - right)).toEqual(positions);
  });

  test("remove plans first, names briefs that cite the item, and deletes only on --yes", async () => {
    const { run, context, videoDirectory } = fixture();
    const [item] = (await run("add", ["saved/Poster One.png"], { note: "Low headline." })).json["data"] as InspirationItem[];
    writeFileAtomic(join(videoDirectory, "brief.md"), `---\nvideo_id: demo/teaser\ndeliverables: [1080x1920@30]\ninspiration: [${item!.id}]\n---\n`);
    const plan = await run("remove", [item!.id]);
    expect(plan.json).toMatchObject({ applied: false, changes: [], warnings: [expect.stringContaining("projects/demo/videos/teaser/brief.md cites")] });
    expect(plan.text).toContain("Run again with --yes to apply.");
    expect(existsSync(join(context.workspaceRoot, "inspiration/items", `${item!.id}.json`))).toBe(true);
    const applied = await run("remove", [item!.id], { yes: true });
    expect(applied.json["changes"]).toEqual([`inspiration/items/${item!.id}.json`, `inspiration/files/${item!.id}`]);
    expect(existsSync(join(context.workspaceRoot, "inspiration/files", item!.id))).toBe(false);
    expect(existsSync(join(videoDirectory, "brief.md"))).toBe(true);
  });

  test("storage reports inspiration bytes and never offers to clear them", async () => {
    const { run, context } = fixture();
    await run("add", ["saved"]);
    const roots = { workspace: context.workspaceRoot, machine: mkdtempSync(join(tmpdir(), "vcr-machine-")) };
    expect(storageReport(roots, DEFAULT_BUDGETS).totals.inspiration).toBe(32);
    expect(planClear(roots, "inspiration", { now })).toMatchObject({ ok: false, error: { code: "INVALID_ARGUMENT" } });
    const sneaky = planClear(roots, "output", { now });
    expect(sneaky).toMatchObject({ ok: true, value: { deletions: [] } });
  });
});
