// `vcr site build`: the public catalogue site, generated into an ignored, disposable directory and
// published to GitHub Pages by CI. Pages come from site-pages.ts, graphs from site-graphs.ts.
import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fail, ok, type Result } from "./result.types.js";
import { buildSiteModel } from "./site-model.js";
import { renderCatalogPage, renderLandingPage, renderStatusPage, renderTechniquePage, renderToolPage } from "./site-pages.js";

// === TYPES ===

export interface SiteBuildOutcome {
  directory: string;
  pageCount: number;
  toolPages: number;
  techniquePages: number;
}

export const SITE_DIRECTORY = "site";
const ASSETS_DIRECTORY = "packages/cli/site-assets";

// === PUBLIC API ===

/** Replaces `outputDirectory` (normally `<harnessRoot>/site`) with a fresh build; nothing in it is hand-edited. */
export function buildSite(harnessRoot: string, outputDirectory = join(harnessRoot, SITE_DIRECTORY)): Result<SiteBuildOutcome> {
  const model = buildSiteModel(harnessRoot);
  if (!model.ok) return model;
  const assetsSource = join(harnessRoot, ASSETS_DIRECTORY);
  if (!existsSync(assetsSource)) return fail("SITE_ASSETS_MISSING", `${ASSETS_DIRECTORY} is missing; site build runs from the VCR repository only.`);

  const pages = new Map<string, string>([
    ["index.html", renderLandingPage(model.value)],
    ["tools/index.html", renderCatalogPage(model.value)],
    ["status.html", renderStatusPage(model.value)],
    ...model.value.tools.map((tool) => [`tools/${tool.id}.html`, renderToolPage(tool, model.value)] as [string, string]),
    ...model.value.techniques.map((technique) => [`techniques/${technique.id}.html`, renderTechniquePage(technique, model.value)] as [string, string]),
  ]);

  rmSync(outputDirectory, { recursive: true, force: true });
  for (const [relativePath, html] of pages) writeOutput(join(outputDirectory, relativePath), html);
  // Pages would otherwise run Jekyll over the output and skip nothing useful.
  writeOutput(join(outputDirectory, ".nojekyll"), "");
  mkdirSync(join(outputDirectory, "assets"), { recursive: true });
  for (const asset of readdirSync(assetsSource)) copyFileSync(join(assetsSource, asset), join(outputDirectory, "assets", asset));

  return ok({ directory: outputDirectory, pageCount: pages.size, toolPages: model.value.tools.length, techniquePages: model.value.techniques.length });
}

// === PRIVATE HELPERS ===

function writeOutput(filePath: string, content: string): void {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, content);
}
