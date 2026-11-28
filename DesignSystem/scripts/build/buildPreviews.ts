import { mkdirSync, writeFileSync } from "node:fs";
import { build } from "esbuild";
import type { ComponentEntry } from "./discoverComponents";
import { assertInlineSafe, SHARED_BUILD_OPTIONS } from "./esbuildOptions";
import { PROJECT_ROOT } from "./paths";
import { reactGlobalsPlugin } from "./reactGlobalsPlugin";

// === PUBLIC API ===

/** Compiles each <Component>.preview.tsx against window.VCRStudio and writes components/<Component>/preview.html. */
export async function buildPreviews(components: readonly ComponentEntry[]): Promise<number> {
  for (const component of components) {
    const result = await build({
      ...SHARED_BUILD_OPTIONS,
      entryPoints: [component.previewPath],
      write: false,
      minify: true,
      plugins: [reactGlobalsPlugin({ withSystemGlobal: true })],
    });
    const script = result.outputFiles.map((file) => file.text).join("\n");
    assertInlineSafe(`${component.name} preview`, script);
    const outputDirectory = `${PROJECT_ROOT}components/${component.name}/`;
    mkdirSync(outputDirectory, { recursive: true });
    writeFileSync(`${outputDirectory}preview.html`, previewDocument(component, script));
  }
  return components.length;
}

// === PRIVATE HELPERS ===

function previewDocument(component: ComponentEntry, script: string): string {
  return [
    `<!-- @dsCard group="${component.group}" height=${component.previewHeightPx} -->`,
    "<!doctype html>",
    "<html>",
    `<head><meta charset="utf-8"><title>${component.name} — preview</title></head>`,
    "<body>",
    '<div id="root"></div>',
    `<script>${script.trim()}</script>`,
    "</body>",
    "</html>",
    "",
  ].join("\n");
}
