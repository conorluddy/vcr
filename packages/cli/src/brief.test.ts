import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { validateWorkspace } from "./validate.js";
import { createFixtureWorkspace, harnessRoot, writeJson } from "./test-workspace.js";
import { parseVideoBrief } from "./brief.js";
import { writeFileAtomic } from "./repository.js";

/** The fictional §12.2 example from the series brief knowledge base, comments stripped: the KB's example must stay valid. */
function lowTideLab(): Record<string, unknown> {
  const knowledgeBase = readFileSync(join(harnessRoot(), "references/series-brief/series-brief-knowledge-base.md"), "utf8");
  const block = /### 12\.2[\s\S]*?```jsonc\n([\s\S]*?)```/.exec(knowledgeBase)?.[1];
  if (!block) throw new Error("§12.2 example not found");
  return JSON.parse(block.split("\n").map((line) => line.replace(/\s+\/\/.*$/, "")).join("\n")) as Record<string, unknown>;
}

const sections = "## Objective\nGet a follow.\n\n## Audience and placement\nMuted feed.\n\n## Content\nOne fact.\n\n## Constraints\nLogo at rest.\n\n## Review notes\nE1 first.\n";

function workspaceWithBriefs(frontMatter: string, body = sections, series: Record<string, unknown> | null = lowTideLab()) {
  const { root, videoDirectory } = createFixtureWorkspace();
  if (series) {
    writeJson(join(root, "projects/demo/brief.json"), series);
    writeFileAtomic(join(root, "projects/demo/tokens/low-tide-lab.tokens.json"), "{}\n");
  }
  writeFileAtomic(join(videoDirectory, "brief.md"), `---\n${frontMatter}\n---\n\n${body}`);
  return root;
}

const validFrontMatter = "video_id: demo/teaser\nseries_brief: low-tide-lab@1.3.0\ndeliverables: [1080x1920@30]\nflash_profile: broadcast";
const messages = (root: string) => validateWorkspace(harnessRoot(), root).diagnostics.map((diagnostic) => `${diagnostic.severity} ${diagnostic.path}: ${diagnostic.message}`);

describe("briefs", () => {
  test("the knowledge base's fictional series brief and a narrowing video brief validate", () => {
    expect(messages(workspaceWithBriefs(validFrontMatter))).toEqual([]);
  });

  test("block lists and quoted values parse", () => {
    const parsed = parseVideoBrief("---\nvideo_id: \"demo/teaser\"\ndeliverables:\n  - 1080x1920@30\n---\nbody");
    expect(parsed).toMatchObject({ ok: true, value: { frontMatter: { video_id: "demo/teaser", deliverables: ["1080x1920@30"] }, body: "body" } });
  });

  test("a series brief missing its required decisions is rejected", () => {
    const { evaluation: _evaluation, ...withoutEvaluation } = lowTideLab();
    expect(messages(workspaceWithBriefs(validFrontMatter, sections, withoutEvaluation))).toContainEqual(expect.stringContaining("evaluation"));
  });

  test.each([
    ["a missing section", validFrontMatter, sections.replace("## Constraints", "## Limits"), "missing section: Constraints"],
    ["a deliverable the series does not have", validFrontMatter.replace("1080x1920@30", "1920x1080@25"), sections, "is not a deliverable of low-tide-lab@1.3.0"],
    ["a looser flash profile", validFrontMatter.replace("broadcast", "wcag"), sections, "unused"],
    ["another series", validFrontMatter.replace("low-tide-lab@1.3.0", "other-series@1.0.0"), sections, "the project's series brief is low-tide-lab@1.3.0"],
    ["the wrong video id", validFrontMatter.replace("demo/teaser", "demo/other"), sections, "does not match its directory"],
    ["unsupported front matter", `${validFrontMatter}\nnested:\n  key: value`, sections, "front matter line"],
  ])("rejects %s", (_label, frontMatter, body, expected) => {
    const series = { ...lowTideLab(), accessibility: { flashProfile: "broadcast" } };
    const found = messages(workspaceWithBriefs(frontMatter, body, series));
    expect(found.filter((message) => message.startsWith("error"))).toContainEqual(expected === "unused" ? expect.stringContaining("looser than") : expect.stringContaining(expected));
  });

  test("citing an older series version is a warning, not an error", () => {
    expect(messages(workspaceWithBriefs(validFrontMatter.replace("1.3.0", "1.2.0")))).toEqual([expect.stringMatching(/^warning \/series_brief: cites low-tide-lab@1.2.0/)]);
  });

  test("a one-off video brief needs no series brief", () => {
    expect(messages(workspaceWithBriefs("video_id: demo/teaser\ndeliverables: [1080x1920@30]", sections, null))).toEqual([]);
  });
});


test("research pillars are accepted as mandatory and preference consumers", () => {
  const series = lowTideLab();
  const consumers = ["domain-exploration", "visual-research", "cultural-context", "image-direction"];
  series.mandatories = [{ id: "M-RESEARCH", rule: "Record the selected evidence.", source: "brief", check: "judgement", consumers }];
  series.preferences = [{ id: "P-RESEARCH", statement: "Prefer inspected references.", weight: 0.5, consumers }];
  expect(messages(workspaceWithBriefs(validFrontMatter, sections, series))).toEqual([]);
  consumers.push("invented-consumer");
  expect(messages(workspaceWithBriefs(validFrontMatter, sections, series)).join(" ")).toContain("must be equal to one of the allowed values");
});
