import { existsSync } from "node:fs";
import { join } from "node:path";
import { fail, ok, type Result } from "./result.types.js";
import type { Diagnostic } from "./validate.js";

// Two briefs, one per level. projects/<project>/brief.json is the series brief (BRIEF §12.1; schema
// catalog/schemas/series-brief). projects/<project>/videos/<video>/brief.md is the human video brief:
// front matter plus the five sections of plugin PRD AG-04. The video brief narrows the series brief
// and never contradicts it.

// === TYPES ===

export interface SeriesBrief {
  id: string;
  version: string;
  tokens: { file: string };
  deliverables: Array<{ width: number; height: number; fps: number }>;
  mandatories?: Array<{ id: string; rule: string }>;
  accessibility?: { flashProfile?: FlashProfile };
}

export type FlashProfile = "wcag" | "broadcast" | "strict";

export interface VideoBriefFrontMatter {
  video_id: string;
  series_brief?: string;
  deliverables: string[];
  flash_profile?: FlashProfile;
  route?: string;
  confirmed?: string;
}

export interface ParsedVideoBrief {
  frontMatter: Record<string, string | string[]>;
  body: string;
}

// === PUBLIC API ===

export const SERIES_BRIEF_FILE = "brief.json";
export const VIDEO_BRIEF_FILE = "brief.md";
export const VIDEO_BRIEF_SECTIONS = ["Objective", "Audience and placement", "Content", "Constraints", "Review notes"] as const;
const FLASH_STRICTNESS: FlashProfile[] = ["wcag", "broadcast", "strict"];

/**
 * Splits `---` front matter from the body. Front matter is a flat YAML subset: `key: value`,
 * `key: [a, b]`, or `key:` followed by `- item` lines. Anything else is an error, not a guess.
 */
export function parseVideoBrief(markdown: string): Result<ParsedVideoBrief> {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(markdown);
  if (!match) return fail("INVALID_BRIEF", "brief.md must start with front matter between --- lines (video_id, deliverables, optional series_brief, flash_profile, route, confirmed).");
  const frontMatter: Record<string, string | string[]> = {};
  let listKey: string | undefined;
  for (const [index, rawLine] of match[1]!.split(/\r?\n/).entries()) {
    const line = rawLine.replace(/\s+#.*$/, "");
    if (line.trim() === "" || line.trim().startsWith("#")) continue;
    const item = /^\s+-\s+(.+)$/.exec(line);
    if (item && listKey) {
      (frontMatter[listKey] as string[]).push(unquote(item[1]!));
      continue;
    }
    const pair = /^([a-z_]+):\s*(.*)$/.exec(line);
    if (!pair) return fail("INVALID_BRIEF", `brief.md front matter line ${index + 1} is not \`key: value\`, \`key: [a, b]\` or a \`- item\` under \`key:\`: "${rawLine}"`);
    const [, key, value] = pair as unknown as [string, string, string];
    listKey = undefined;
    if (value === "") {
      frontMatter[key] = [];
      listKey = key;
    } else if (value.startsWith("[") && value.endsWith("]")) {
      frontMatter[key] = value.slice(1, -1).split(",").map((entry) => unquote(entry.trim())).filter(Boolean);
    } else frontMatter[key] = unquote(value.trim());
  }
  return ok({ frontMatter, body: match[2]! });
}

/** Rules across the two briefs and the video's location that the schemas cannot express. */
export function videoBriefDiagnostics(videoId: string, brief: VideoBriefFrontMatter, body: string, seriesBrief: SeriesBrief | undefined, file: string): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const error = (path: string, message: string, suggestion: string) => diagnostics.push({ severity: "error", file, path, message, suggestion });
  if (brief.video_id !== videoId) error("/video_id", `video_id ${brief.video_id} does not match its directory (${videoId})`, "Keep brief.md in projects/<project>/videos/<video>/ with that id.");
  const missing = VIDEO_BRIEF_SECTIONS.filter((section) => !new RegExp(`^##\\s+${section}\\s*$`, "im").test(body));
  if (missing.length > 0) error("", `missing section${missing.length === 1 ? "" : "s"}: ${missing.join(", ")}`, `A video brief has five \`##\` sections: ${VIDEO_BRIEF_SECTIONS.join(", ")}.`);
  if (!seriesBrief) {
    if (brief.series_brief) error("/series_brief", `cites ${brief.series_brief} but the project has no ${SERIES_BRIEF_FILE}`, "Write the series brief, or remove series_brief for a one-off video.");
    return diagnostics;
  }
  const cited = `${seriesBrief.id}@${seriesBrief.version}`;
  if (!brief.series_brief) error("/series_brief", `the project has a series brief (${cited}) but this video does not cite it`, `Add series_brief: ${cited}.`);
  else if (brief.series_brief.split("@")[0] !== seriesBrief.id) error("/series_brief", `cites ${brief.series_brief}, but the project's series brief is ${cited}`, `Cite ${cited}.`);
  else if (brief.series_brief !== cited) diagnostics.push({ severity: "warning", file, path: "/series_brief", message: `cites ${brief.series_brief}; the series brief is now ${cited}`, suggestion: "Re-read the series brief for what changed, update this brief, cite the new version and ask the human to confirm again." });
  const allowed = new Set(seriesBrief.deliverables.map((deliverable) => `${deliverable.width}x${deliverable.height}@${deliverable.fps}`));
  for (const deliverable of brief.deliverables) {
    if (!allowed.has(deliverable)) error("/deliverables", `${deliverable} is not a deliverable of ${cited}`, `A video brief narrows the series brief; choose from ${[...allowed].join(", ")}, or add the deliverable to the series brief first.`);
  }
  const seriesFlash = seriesBrief.accessibility?.flashProfile;
  if (seriesFlash && brief.flash_profile && FLASH_STRICTNESS.indexOf(brief.flash_profile) < FLASH_STRICTNESS.indexOf(seriesFlash)) {
    error("/flash_profile", `${brief.flash_profile} is looser than the series brief's ${seriesFlash}`, "A video may tighten the flash profile, never loosen it.");
  }
  return diagnostics;
}

export function seriesBriefDiagnostics(brief: SeriesBrief, projectDirectory: string, file: string): Diagnostic[] {
  if (existsSync(join(projectDirectory, brief.tokens.file))) return [];
  return [{ severity: "warning", file, path: "/tokens/file", message: `token file ${brief.tokens.file} does not exist`, suggestion: "Write the DTCG tokens under the project's brand/ directory, or fix the path (it is relative to the project)." }];
}

// === PRIVATE HELPERS ===

function unquote(value: string): string {
  return /^(["']).*\1$/.test(value) ? value.slice(1, -1) : value;
}
