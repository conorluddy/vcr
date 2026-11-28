import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { build } from "esbuild";
import type { ComponentEntry } from "./discoverComponents";
import { assertInlineSafe, SHARED_BUILD_OPTIONS } from "./esbuildOptions";
import { NAMESPACE, PROJECT_ROOT, SOURCE_ROOT } from "./paths";
import { reactGlobalsPlugin } from "./reactGlobalsPlugin";

// === PUBLIC API ===

/** Writes components/bundle.js (one classic script assigning window.VCRStudio) and components/bundle.css. */
export async function buildBundle(
  components: readonly ComponentEntry[],
): Promise<{ bundleBytes: number; stylesheetBytes: number }> {
  const outputDirectory = `${PROJECT_ROOT}components/`;
  mkdirSync(outputDirectory, { recursive: true });
  await build({
    ...SHARED_BUILD_OPTIONS,
    entryPoints: [`${SOURCE_ROOT}bundleEntry.ts`],
    outfile: `${outputDirectory}bundle.js`,
    plugins: [reactGlobalsPlugin({ withSystemGlobal: false })],
  });
  const bundle = `${bundleHeader(components)}\n${readFileSync(`${outputDirectory}bundle.js`, "utf8")}`;
  const stylesheet = readFileSync(`${outputDirectory}bundle.css`, "utf8");
  assertInlineSafe("bundle.js", bundle);
  assertStylesheetSafe(stylesheet);
  writeFileSync(`${outputDirectory}bundle.js`, bundle);
  return { bundleBytes: Buffer.byteLength(bundle), stylesheetBytes: Buffer.byteLength(stylesheet) };
}

// === PRIVATE HELPERS ===

function bundleHeader(components: readonly ComponentEntry[]): string {
  const header = {
    format: 4,
    namespace: NAMESPACE,
    components: components.map((component) => ({ name: component.name })),
  };
  return `/* @ds-bundle: ${JSON.stringify(header)} */`;
}

function assertStylesheetSafe(stylesheet: string): void {
  if (/<\/style/i.test(stylesheet)) {
    throw new Error('bundle.css contains "</style", which breaks inlining in a <style>.');
  }
}
