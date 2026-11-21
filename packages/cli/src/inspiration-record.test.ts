import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { INSPIRATION_PATHS, sha256OfFile, type InspirationItem } from "./inspiration-record.js";
import { writeFileAtomic } from "./repository.js";
import { sha256Hex } from "./review.js";
import { createFixtureWorkspace, harnessRoot, writeJson } from "./test-workspace.js";
import { validateWorkspace } from "./validate.js";

const POSTER_BYTES = "not really a png";

function posterItem(overrides: Partial<InspirationItem> = {}): InspirationItem {
  return {
    schema_version: "1.0.0",
    id: "poster-0a1b2c",
    kind: "image",
    title: "Poster",
    note: "The headline sits low and the top two thirds stay empty.",
    aspects: ["composition"],
    use: "inspiration",
    file: { name: "poster.png", sha256: sha256Hex(POSTER_BYTES), bytes: POSTER_BYTES.length, media_type: "image/png" },
    added_at: "2026-11-21T10:00:00.000Z",
    ...overrides,
  };
}

/** A fixture workspace holding the given records; the poster's copied file is written unless `copiedBytes` is null. */
function workspaceWithItems(items: object[], copiedBytes: string | null = POSTER_BYTES): { root: string; videoDirectory: string } {
  const workspace = createFixtureWorkspace();
  for (const item of items) writeJson(join(workspace.root, INSPIRATION_PATHS.items, `${(item as { id: string }).id}.json`), item);
  if (copiedBytes !== null) writeFileAtomic(join(workspace.root, INSPIRATION_PATHS.files, "poster-0a1b2c/poster.png"), copiedBytes);
  return workspace;
}

const messages = (root: string) => validateWorkspace(harnessRoot(), root).diagnostics.map((diagnostic) => `${diagnostic.severity} ${diagnostic.path}: ${diagnostic.message}`);

describe("inspiration records", () => {
  test("an annotated item with its copied file is clean, as is a colour set", () => {
    const colourSet = { schema_version: "1.0.0", id: "harbour-night", kind: "colours", title: "Harbour night", note: "Navy with one warm accent.", use: "inspiration", colours: ["#0B1F3A", "#F2A33A"], added_at: "2026-11-21T10:00:00.000Z" };
    expect(messages(workspaceWithItems([posterItem(), colourSet]).root)).toEqual([]);
  });

  test("an asset with unknown rights is an error, and one with evidence is clean", () => {
    expect(messages(workspaceWithItems([posterItem({ use: "asset", rights: "unknown" })]).root)).toEqual([expect.stringMatching(/^error \/rights: an asset needs rights evidence/)]);
    expect(messages(workspaceWithItems([posterItem({ use: "asset", rights: { evidence: "Own work." } })]).root)).toEqual([]);
  });

  test("an asset that states no rights at all fails the schema", () => {
    expect(messages(workspaceWithItems([posterItem({ use: "asset" })]).root)).toContainEqual(expect.stringMatching(/^error .*rights/));
  });

  test("a copied file that no longer matches its hash is an error", () => {
    expect(messages(workspaceWithItems([posterItem()], "a different file").root)).toEqual([expect.stringMatching(/^error \/file\/sha256: .*no longer matches/)]);
  });

  test("an absent copied file is a warning, since a fresh clone has none", () => {
    expect(messages(workspaceWithItems([posterItem()], null).root)).toEqual([expect.stringMatching(/^warning \/file: .*is absent/)]);
  });

  test("a missing note is a warning that observations do not clear", () => {
    const { note: _note, ...unannotated } = posterItem({ observations: [{ aspect: "composition", observed: "Headline in the lower third.", by: { agent: "inspiration-analyst", model: "some-model" }, at: "2026-11-21T10:05:00.000Z" }] });
    expect(messages(workspaceWithItems([unannotated]).root)).toEqual([expect.stringMatching(/^warning \/note: no note/)]);
  });

  test("a record named differently from its id is an error", () => {
    const { root } = workspaceWithItems([]);
    writeJson(join(root, INSPIRATION_PATHS.items, "renamed.json"), posterItem());
    expect(messages(root)).toEqual([expect.stringMatching(/^error \/id: id poster-0a1b2c does not match its file name/)]);
  });

  test("a colour set with a file, facts without their tool, and an unknown field are schema errors", () => {
    const base = posterItem();
    const invalid = [
      { ...base, id: "set-with-file", kind: "colours", colours: ["#000"] },
      { ...base, id: "facts-unsigned", facts: { width: 10, height: 10 } },
      { ...base, id: "extra-field", description: "one text field for everything" },
    ];
    const files = validateWorkspace(harnessRoot(), workspaceWithItems(invalid).root).diagnostics.filter((diagnostic) => diagnostic.severity === "error").map((diagnostic) => diagnostic.file);
    expect(new Set(files)).toEqual(new Set(invalid.map((item) => `${INSPIRATION_PATHS.items}/${item.id}.json`)));
  });

  test("a video brief may cite library items, and an unknown id is an error", () => {
    const sections = "## Objective\nx\n\n## Audience and placement\nx\n\n## Content\nx\n\n## Constraints\nx\n\n## Review notes\nx\n";
    const { root, videoDirectory } = workspaceWithItems([posterItem()]);
    const writeBrief = (cited: string) => writeFileAtomic(join(videoDirectory, "brief.md"), `---\nvideo_id: demo/teaser\ndeliverables: [1080x1920@30]\ninspiration: [${cited}]\n---\n\n${sections}`);
    writeBrief("poster-0a1b2c");
    expect(messages(root)).toEqual([]);
    writeBrief("poster-0a1b2c, not-in-library");
    expect(messages(root)).toEqual(['error /inspiration: cites inspiration "not-in-library", which is not in inspiration/items/']);
  });

  test("sha256OfFile agrees with hashing the whole content", () => {
    const { root } = workspaceWithItems([]);
    expect(sha256OfFile(join(root, INSPIRATION_PATHS.files, "poster-0a1b2c/poster.png"))).toBe(sha256Hex(POSTER_BYTES));
  });
});
